import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { basename, extname } from 'path';
import { BusinessException } from '../exception/business-exception';
import { ErrorType } from '../exception/error-code.enum';
import { tz } from '../utils/date-util';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (): MulterOptions => ({
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
          const allowed = ['image/png', 'image/jpeg', 'image/webp'];
          if (allowed.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new BusinessException(
                ErrorType.INVALID_FILE_FORMAT,
                'Only PNG, JPEG, and WEBP formats under 20 MB are allowed.',
              ),
              false,
            );
          }
        },
        limits: {
          fileSize: 15 * 1_000_000, // 15 000 000 bytes
        },
      }),
    }),
  ],
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (cs: ConfigService) =>
        new S3Client({
          region: cs.get<string>('AWS_S3_REGION')!,
          credentials: {
            accessKeyId: cs.get<string>('AWS_S3_ACCESS')!,
            secretAccessKey: cs.get<string>('AWS_S3_SECRET')!,
          },
        }),
      inject: [ConfigService],
    },
  ],
  exports: ['S3_CLIENT'],
})
export class S3Module {}
