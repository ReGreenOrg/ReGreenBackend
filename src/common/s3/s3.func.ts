import { basename, extname } from 'path';
import { tz } from '../utils/date-util';

export function getContentType(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export function getS3Url(key: string): string {
  const region = process.env.AWS_S3_REGION;
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

export function getS3FileInfo(dir: string, file: Express.Multer.File) {
  const ext = extname(file.originalname);
  const name = basename(file.originalname, ext);
  const timestamp = tz().format('YYYY-MM-DD:::HH:mm:ss');

  const key = `${dir}/${name}-${timestamp}${ext}`;

  return {
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key,
    body: file.buffer,
    contentType: getContentType(ext),
    s3Url: getS3Url(key),
  };
}
