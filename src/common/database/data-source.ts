import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getDataSourceConfig } from './orm.config';

const cs = new ConfigService();
export const AppDataSource = new DataSource(getDataSourceConfig(cs));
