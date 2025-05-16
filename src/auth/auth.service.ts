import { Member } from '../member/entities/member.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as uuid from 'uuid';
import { createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { MemberService } from '../member/member.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly tokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly profileUrl = 'https://kapi.kakao.com/v2/user/me';

  constructor(
    private readonly http: HttpService,
    private readonly cs: ConfigService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly memberService: MemberService,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async getToken(code: string, local: boolean): Promise<string> {
    const redirectUri = local
      ? 'http://localhost:3000/login'
      : this.cs.getOrThrow<string>('KAKAO_REDIRECT_URI');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.cs.getOrThrow<string>('KAKAO_CLIENT_ID'),
      redirect_uri: redirectUri,
      code,
    });

    const secret = this.cs.getOrThrow<string>('KAKAO_CLIENT_SECRET');
    if (secret) body.append('client_secret', secret);

    try {
      const { data } = await firstValueFrom(
        this.http.post(this.tokenUrl, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return data.access_token as string;
    } catch (e: any) {
      throw new HttpException(
        e?.response?.data ?? 'Kakao token error',
        e?.response?.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getProfile(accessToken: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(this.profileUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return data;
    } catch (e: any) {
      throw new HttpException(
        e?.response?.data ?? 'Kakao profile error',
        e?.response?.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  async upsertMember(profile: any): Promise<Member> {
    const kakaoAccount = profile.kakao_account ?? {};
    const email = kakaoAccount.email;
    const nickname = kakaoAccount.profile?.nickname;
    const profileImageUrl = kakaoAccount.profile?.profile_image_url;

    let member = await this.memberRepo.findOne({
      where: { email },
    });

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

      return updated ? await this.memberRepo.save(member) : member;
    } else {
      const newMember = this.memberRepo.create({
        nickname,
        email,
        profileImageUrl,
      });
      return await this.memberRepo.save(newMember);
    }
  }

  private async sign(payload, secret, exp) {
    return this.jwt.signAsync(payload, { secret, expiresIn: exp });
  }

  private rtKey(jti: string) {
    const hash = createHash('sha256').update(jti).digest('hex');
    return `rt:${hash}`;
  }

  private rtTtlSec() {
    return <number>this.cs.get('JWT_REFRESH_EXPIRES') / 1000;
  }

  async issueTokens(member: Member) {
    const accessToken = await this.sign(
      { sub: member.id },
      this.cs.get<string>('JWT_ACCESS_SECRET'),
      this.cs.get<string>('JWT_ACCESS_EXPIRES'),
    );

    const jti = uuid.v1(); // 토큰 ID
    const refreshToken = await this.sign(
      { sub: member.id, jti },
      this.cs.get('JWT_REFRESH_SECRET'),
      this.cs.get('JWT_REFRESH_EXPIRES'),
    );

    // Redis: rt:<hash(jti)> = memberId  (TTL = 14d)
    const key = this.rtKey(jti);
    const ttl = this.rtTtlSec();

    await this.redis.set(key, member.id, { ttl });
    await this.redis.pushToSet(`memberRTs:${member.id}`, key, ttl);

    return { accessToken, refreshToken };
  }

  async rotate(memberId: string, oldJti: string) {
    const key = this.rtKey(oldJti);
    const ownerId = await this.redis.get<string>(key);

    if (ownerId !== memberId)
      throw new UnauthorizedException('RefreshToken invalid');

    await this.redis.del(key);
    await this.revokeAll(memberId);
    return this.issueTokens({ id: memberId } as Member);
  }

  async revokeAll(memberId: string) {
    const listKey = `memberRTs:${memberId}`;
    const keys = await this.redis.popAll(listKey);
    if (keys.length) await Promise.all(keys.map((k) => this.redis.del(k)));
  }
}
