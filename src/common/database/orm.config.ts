import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

const isProd = process.env.NODE_ENV === 'production';

export function getDataSourceConfig(cs: ConfigService): DataSourceOptions {
  return {
    type: 'mysql',
    host: cs.get<string>('MYSQL_HOST')!,
    port: +cs.get<string>('MYSQL_PORT')!,
    username: cs.get<string>('MYSQL_USER')!,
    password: cs.get<string>('MYSQL_PASS')!,
    database: cs.get<string>('MYSQL_NAME')!,
    timezone: '+09:00',
    entities: [__dirname + '/../../**/*.entity.{ts,js}'],
    migrations: isProd
      ? ['dist/common/database/migration/*.js']
      : [__dirname + '/migration/*.ts'],
    synchronize: true,
  };
}
