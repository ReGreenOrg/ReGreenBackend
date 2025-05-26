import { EcoVerificationType } from '../../../domain/eco-verification/constant/eco-verification-type.enum';

export const ECO_PROMPTS: Record<EcoVerificationType, string> = {
  REUSABLE_CUP:
    `Return a JSON object exactly like {"isValid": true|false, "reason": "<Korean reason>"}. ` +
    `"isValid" must be true only when the main subject of the photo is a reusable beverage cup, ` +
    `including reusable plastic tumblers, stainless-steel, glass, or ceramic cups. ` +
    `Disposable single-use plastic or paper take-out cups must be marked false. ` +
    `No matter the result, always provide a short Korean sentence in the "reason" field.`,

  PLOGGING_PROOF:
    `Return {"isValid": true|false, "reason": "<Korean reason>"}. ` +
    `Set "isValid" to true if the photo shows at least one of the following: ` +
    `1) collected litter or a filled trash bag, or ` +
    `2) a plogging tool or context (litter picker, glove, or a person holding litter outdoors). ` +
    `If neither element is visible, return false and state in Korean what is missing.`,
};
