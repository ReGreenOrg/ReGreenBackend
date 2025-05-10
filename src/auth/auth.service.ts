import { Member } from '../member/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { RefreshToken } from './entities/refresh-token.entity';
import { StateService } from './state.service';

@Injectable()
export class AuthService {
  private readonly tokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly profileUrl = 'https://kapi.kakao.com/v2/user/me';

  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    private readonly http: HttpService,
    private readonly cs: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async getToken(code: string): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.cs.getOrThrow<string>('KAKAO_CLIENT_ID'),
      redirect_uri: this.cs.getOrThrow<string>('KAKAO_REDIRECT_URI'),
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
    const kakaoId = profile.id;
    const kakaoAccount = profile.kakao_account ?? {};
    const email = kakaoAccount.email;
    const nickname = kakaoAccount.profile?.nickname;
    const profileImageUrl = kakaoAccount.profile?.profile_image_url;

    let member = await this.memberRepo.findOne({
      where: { email },
    });

    if (!member) {
      member = this.memberRepo.create({
        nickname,
        email,
        profileImageUrl,
      });
      await this.memberRepo.save(member);
    }
    return member;
  }

  async signToken(payload: string) {
    return await this.jwt.signAsync(
      { sub: payload },
      {
        secret: this.cs.get('JWT_SECRET'),
        expiresIn: this.cs.get('JWT_EXPIRES'),
      },
    );
  }

  private async sign(payload, secret, exp) {
    return this.jwt.signAsync(payload, { secret, expiresIn: exp });
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

    // DB 저장: hash(jti)
    const hash = createHash('sha256').update(jti).digest('hex');
    const expires = new Date(Date.now() + this.cs.get('JWT_REFRESH_EXPIRES')!);
    await this.refreshRepo.save({
      token: hash,
      member,
      expiresAt: expires,
    });

    return { accessToken, refreshToken };
  }

  async rotate(memberId: string, oldJti: string) {
    const hash = createHash('sha256').update(oldJti).digest('hex');
    const stored = await this.refreshRepo.findOne({
      where: { token: hash, member: { id: memberId } },
    });

    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('RT invalid');

    await this.refreshRepo.delete(stored.id);
    return this.issueTokens(stored.member);
  }

  async revokeAll(memberId: string) {
    await this.refreshRepo.delete({ member: { id: memberId } });
  }
}
