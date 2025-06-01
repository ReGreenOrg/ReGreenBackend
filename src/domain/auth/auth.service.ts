import { Member } from '../member/entities/member.entity';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as uuid from 'uuid';
import { createHash } from 'crypto';
import { RedisService } from '../../common/redis/redis.service';
import { MemberService } from '../member/member.service';
import { BusinessException } from '../../common/exception/business-exception';
import { ErrorType } from '../../common/exception/error-code.enum';

@Injectable()
export class AuthService {
  private readonly tokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly profileUrl = 'https://kapi.kakao.com/v2/user/me';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly memberService: MemberService,
  ) {}

  async getToken(code: string, local: boolean): Promise<string> {
    const redirectUri = local
      ? 'http://localhost:3000/login'
      : this.configService.getOrThrow<string>('KAKAO_REDIRECT_URI');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      redirect_uri: redirectUri,
      code,
    });

    const secret = this.configService.getOrThrow<string>('KAKAO_CLIENT_SECRET');
    if (secret) body.append('client_secret', secret);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.tokenUrl, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return data.access_token as string;
    } catch (e: any) {
      const { error, error_description, error_code } = e?.response?.data;
      throw new BusinessException(
        ErrorType.KAKAO_LOGIN_FAILED,
        `[${error_code}] ${error} -> ${error_description}`,
      );
    }
  }

  async getProfile(accessToken: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.profileUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return data;
    } catch (e: any) {
      const { error, error_description, error_code } = e?.response?.data;
      throw new BusinessException(
        ErrorType.KAKAO_LOGIN_FAILED,
        `[${error_code}] ${error} -> ${error_description}`,
      );
    }
  }

  async upsertMember(profile: any): Promise<Member> {
    const kakaoAccount = profile.kakao_account ?? {};
    const email = kakaoAccount.email;
    const nickname = kakaoAccount.profile?.nickname;
    const profileImageUrl = kakaoAccount.profile?.profile_image_url;

    let member = await this.memberService.findByEmail(email);

    if (member) {
      let updated = false;

      if (nickname && member.nickname !== nickname) {
        member.nickname = nickname;
        updated = true;
      }
      if (profileImageUrl && member.profileImageUrl !== profileImageUrl) {
        member.profileImageUrl = profileImageUrl;
        updated = true;
      }

      return updated ? await this.memberService.save(member) : member;
    } else {
      return await this.memberService.createAndSave({
        nickname,
        email,
        profileImageUrl,
      });
    }
  }

  private async sign(payload, secret, exp) {
    return this.jwtService.signAsync(payload, { secret, expiresIn: exp });
  }

  private rtKey(jti: string) {
    const hash = createHash('sha256').update(jti).digest('hex');
    return `rt:${hash}`;
  }

  private rtTtlSec() {
    return <number>this.configService.get('JWT_REFRESH_EXPIRES') / 1000;
  }

  async issueTokens(member: Member) {
    const accessToken = await this.sign(
      { sub: member.id },
      this.configService.get<string>('JWT_ACCESS_SECRET'),
      this.configService.get<string>('JWT_ACCESS_EXPIRES'),
    );

    const jti = uuid.v1();
    const refreshToken = await this.sign(
      { sub: member.id, jti },
      this.configService.get('JWT_REFRESH_SECRET'),
      this.configService.get('JWT_REFRESH_EXPIRES'),
    );

    // Redis: rt:<hash(jti)> = memberId  (TTL = 14d)
    const key = this.rtKey(jti);
    const ttl = this.rtTtlSec();

    await this.redisService.set(key, member.id, { ttl });
    await this.redisService.pushToSet(`memberRTs:${member.id}`, key, ttl);

    return { accessToken, refreshToken };
  }

  async rotate(memberId: string, oldJti?: string) {
    if (!oldJti) {
      throw new BusinessException(ErrorType.INVALID_REFRESH_TOKEN);
    }

    const key = this.rtKey(oldJti);
    const ownerId = await this.redisService.get<string>(key);

    if (ownerId !== memberId) {
      throw new BusinessException(ErrorType.INVALID_REFRESH_TOKEN);
    }

    await this.redisService.del(key);
    await this.revokeAll(memberId);
    return this.issueTokens({ id: memberId } as Member);
  }

  async revokeAll(memberId: string) {
    const listKey = `memberRTs:${memberId}`;
    const keys = await this.redisService.popAll(listKey);
    if (keys.length)
      await Promise.all(keys.map((k) => this.redisService.del(k)));
  }
}
