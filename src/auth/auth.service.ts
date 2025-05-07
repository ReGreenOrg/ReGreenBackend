import { Member } from '../member/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly tokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly profileUrl = 'https://kapi.kakao.com/v2/user/me';

  constructor(
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
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
      console.log(data);
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

  async issueAccessToken(memberId: number) {
    return await this.jwt.signAsync(
      { sub: memberId },
      {
        secret: this.cs.get('JWT_SECRET'),
        expiresIn: this.cs.get('JWT_EXPIRES'),
      },
    );
  }
}
