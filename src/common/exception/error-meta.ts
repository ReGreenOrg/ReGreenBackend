import { ErrorCode } from './error-code.enum';
import { HttpStatus } from '@nestjs/common';

export interface ErrorMeta {
  code: number;
  message: string;
  status: HttpStatus;
}

export const ERROR_META: Record<ErrorCode, ErrorMeta> = {
  /* common */
  [ErrorCode.INVALID_REQUEST]: {
    code: 40000,
    message: 'Invalid request',
    status: HttpStatus.BAD_REQUEST,
  },
  [ErrorCode.UNAUTHORIZED]: {
    code: 40001,
    message: 'Unauthorized',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorCode.FORBIDDEN]: {
    code: 40002,
    message: 'Forbidden',
    status: HttpStatus.FORBIDDEN,
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    code: 40003,
    message: 'Resource not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: 50000,
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  /* auth */
  [ErrorCode.KAKAO_LOGIN_FAILED]: {
    code: 41001,
    message: 'Kakao login failed',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorCode.INVALID_REFRESH_TOKEN]: {
    code: 41002,
    message: 'Invalid refresh token',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorCode.INVALID_ACCESS_TOKEN]: {
    code: 41003,
    message: 'Invalid access token',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: {
    code: 41004,
    message: 'Expired refresh token',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorCode.ACCESS_TOKEN_EXPIRED]: {
    code: 41005,
    message: 'Expired access token',
    status: HttpStatus.UNAUTHORIZED,
  },

  /* couple */
  [ErrorCode.COUPLE_NOT_FOUND]: {
    code: 42001,
    message: 'Couple not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.ALREADY_IN_COUPLE]: {
    code: 42002,
    message: 'Already in a couple',
    status: HttpStatus.CONFLICT,
  },
  [ErrorCode.INVALID_COUPLE_CODE]: {
    code: 42003,
    message: 'Invalid or expired couple code',
    status: HttpStatus.BAD_REQUEST,
  },
  [ErrorCode.CANNOT_USE_OWN_COUPLE_CODE]: {
    code: 42004,
    message: 'Cannot use own invite code',
    status: HttpStatus.BAD_REQUEST,
  },

  /* coupleItem */
  [ErrorCode.COUPLE_ITEM_NOT_FOUND]: {
    code: 43001,
    message: 'Couple item not found',
    status: HttpStatus.NOT_FOUND,
  },

  /* ecoVerification */
  [ErrorCode.ECO_VERIFICATION_NOT_FOUND]: {
    code: 44001,
    message: 'EcoVerification not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.INVALID_FILE_FORMAT]: {
    code: 54001,
    message: 'The file was not transferred.',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },

  /* item */
  [ErrorCode.ITEM_NOT_FOUND]: {
    code: 45001,
    message: 'Item not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.ALREADY_OWNED_ITEM]: {
    code: 45002,
    message: 'Item already owned',
    status: HttpStatus.CONFLICT,
  },
  [ErrorCode.NOT_ENOUGH_POINTS]: {
    code: 45003,
    message: 'Not enough points',
    status: HttpStatus.BAD_REQUEST,
  },

  [ErrorCode.NOT_FOUND_DEFAULT_ITEM]: {
    code: 55001,
    message: 'Default item not found',
    status: HttpStatus.BAD_REQUEST,
  },

  /* member */
  [ErrorCode.MEMBER_NOT_FOUND]: {
    code: 46001,
    message: 'Member not found',
    status: HttpStatus.NOT_FOUND,
  },

  /* memberEcoVerification */
  [ErrorCode.MEMBER_ECO_VERIFICATION_NOT_FOUND]: {
    code: 47001,
    message: 'Member ecoVerification not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.MEMBER_ECO_VERIFICATION_MISMATCH]: {
    code: 47002,
    message: 'Member and ecoVerification mismatch',
    status: HttpStatus.CONFLICT,
  },
};
