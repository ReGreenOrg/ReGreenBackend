import { SetMetadata } from '@nestjs/common';
import { DomainCode } from '../constant/domain-code.constant';

export const API_DOMAIN_KEY = 'apiDomain';
export const ApiDomain = (domain: DomainCode) =>
  SetMetadata(API_DOMAIN_KEY, domain);
