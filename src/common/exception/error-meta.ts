import { ErrorType } from './error-code.enum';
import { HttpStatus } from '@nestjs/common';

export interface ErrorMeta {
  code: number;
  message: string;
  status: HttpStatus;
}

export const ERROR_META: Record<ErrorType, ErrorMeta> = {
  /* common */
  [ErrorType.INVALID_REQUEST]: {
    code: 40000,
    message: 'Invalid request',
    status: HttpStatus.BAD_REQUEST,
  },
  [ErrorType.UNAUTHORIZED]: {
    code: 40001,
    message: 'Unauthorized',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorType.FORBIDDEN]: {
    code: 40002,
    message: 'Forbidden',
    status: HttpStatus.FORBIDDEN,
  },
  [ErrorType.RESOURCE_NOT_FOUND]: {
    code: 40003,
    message: 'Resource not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorType.INTERNAL_SERVER_ERROR]: {
    code: 50000,
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  /* auth */
  [ErrorType.KAKAO_LOGIN_FAILED]: {
    code: 41001,
    message: 'Kakao login failed',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorType.INVALID_REFRESH_TOKEN]: {
    code: 41002,
    message: 'Invalid refresh token',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorType.INVALID_ACCESS_TOKEN]: {
    code: 41003,
    message: 'Invalid access token',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorType.REFRESH_TOKEN_EXPIRED]: {
    code: 41004,
    message: 'Expired refresh token',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ErrorType.ACCESS_TOKEN_EXPIRED]: {
    code: 41005,
    message: 'Expired access token',
    status: HttpStatus.UNAUTHORIZED,
  },

  /* couple */
  [ErrorType.COUPLE_NOT_FOUND]: {
    code: 42001,
    message: 'Couple not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorType.ALREADY_IN_COUPLE]: {
    code: 42002,
    message: 'Already in a couple',
    status: HttpStatus.CONFLICT,
  },
  [ErrorType.INVALID_COUPLE_CODE]: {
    code: 42003,
    message: 'Invalid or expired couple code',
    status: HttpStatus.BAD_REQUEST,
  },
  [ErrorType.CANNOT_USE_OWN_COUPLE_CODE]: {
    code: 42004,
    message: 'Cannot use own invite code',
    status: HttpStatus.BAD_REQUEST,
  },

  /* coupleItem */
  [ErrorType.COUPLE_ITEM_NOT_FOUND]: {
    code: 43001,
    message: 'Couple item not found',
    status: HttpStatus.NOT_FOUND,
  },

  /* ecoVerification */
  [ErrorType.ECO_VERIFICATION_NOT_FOUND]: {
    code: 44001,
    message: 'EcoVerification not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorType.INVALID_FILE_FORMAT]: {
    code: 54001,
    message: 'The file was not transferred.',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },

  /* item */
  [ErrorType.ITEM_NOT_FOUND]: {
    code: 45001,
    message: 'Item not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorType.ALREADY_OWNED_ITEM]: {
    code: 45002,
    message: 'Item already owned',
    status: HttpStatus.CONFLICT,
  },
  [ErrorType.NOT_ENOUGH_POINTS]: {
    code: 45003,
    message: 'Not enough points',
    status: HttpStatus.BAD_REQUEST,
  },

  [ErrorType.NOT_FOUND_DEFAULT_ITEM]: {
    code: 55001,
    message: 'Default item not found',
    status: HttpStatus.BAD_REQUEST,
  },

  /* member */
  [ErrorType.MEMBER_NOT_FOUND]: {
    code: 46001,
    message: 'Member not found',
    status: HttpStatus.NOT_FOUND,
  },

  /* memberEcoVerification */
  [ErrorType.MEMBER_ECO_VERIFICATION_NOT_FOUND]: {
    code: 47001,
    message: 'Member ecoVerification not found',
    status: HttpStatus.NOT_FOUND,
  },
  [ErrorType.MEMBER_ECO_VERIFICATION_MISMATCH]: {
    code: 47002,
    message: 'Member and ecoVerification mismatch',
    status: HttpStatus.CONFLICT,
  },
  [ErrorType.ALREADY_APPROVED_ECO_VERIFICATION_TODAY]: {
    code: 47003,
    message: 'Already approved ecoVerification type today',
    status: HttpStatus.CONFLICT,
  },
  [ErrorType.ALREADY_SUBMITTED_ECO_VERIFICATION_LINK]: {
    code: 47004,
    message: 'Already submitted eco verification link',
    status: HttpStatus.BAD_REQUEST,
  },
  [ErrorType.INVALID_ECO_REVIEW_REQUEST_STATUS]: {
    code: 47005,
    message:
      'Request review is only possible if the current status is REJECTED.',
    status: HttpStatus.BAD_REQUEST,
  },
  [ErrorType.INVALID_ECO_ADD_LINK_STATUS]: {
    code: 47006,
    message:
      'Adding link is only possible if the current status is APPROVED.',
    status: HttpStatus.BAD_REQUEST,
  },
  // 네트워크·rate-limit 등 OpenAI SDK 오류
  [ErrorType.VISION_SERVICE_UNAVAILABLE]: {
    code: 57001,
    message: 'Openai vision service unavailable',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  // content_filter(blocked) 이거나 응답 형식 불일치
  [ErrorType.INVALID_VISION_RESPONSE]: {
    code: 57002,
    message: 'Invalid openai vision response',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  [ErrorType.VISION_JSON_PARSE_ERROR]: {
    code: 57003,
    message: 'Openai vision json parse error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  [ErrorType.VISION_SCHEMA_MISMATCH]: {
    code: 57004,
    message: 'Openai vision schema mismatch',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
