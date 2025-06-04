import { Dayjs } from 'dayjs';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

export function tz(d?: string | number | Date | null | undefined): Dayjs {
  return dayjs.tz(d);
}
