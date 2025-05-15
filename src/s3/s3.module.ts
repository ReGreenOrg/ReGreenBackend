import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { basename, extname } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService): MulterOptions => ({
        storage: multerS3({
          s3: new S3Client({
            region: cs.get<string>('AWS_S3_REGION')!,
            credentials: {
              accessKeyId: cs.get<string>('AWS_S3_ACCESS')!,
              secretAccessKey: cs.get<string>('AWS_S3_SECRET')!,
            },
          }),
          bucket: cs.get<string>('AWS_S3_BUCKET_NAME')!,
          //acl: 'public-read',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          metadata(req, file, callback) {
            callback(null, { owner: 'it' });
          },
          key(req, file, callback) {
            const ext = extname(file.originalname); // 확장자
            const baseName = basename(file.originalname, ext); // 확장자 제외
            // 파일이름-날짜.확장자
            const fileName = `images/${baseName}-${Date.now()}${ext}`;
            callback(null, fileName);
          },
        }),
        // 파일 크기 제한
        limits: {
          fileSize: 20 * 1024 * 1024,
        },
      }),
    }),
  ],
  providers: [S3Service],
  exports: [S3Service, MulterModule],
})
export class S3Module {}
