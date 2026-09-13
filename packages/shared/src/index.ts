/**
 * @propertycheck/shared
 *
 * Shared utilities, constants, and schemas for PropertyCheck
 */

// Constants exports
export {
  PROPERTY_TYPES,
  INSPECTION_STATUSES,
  SUBSCRIPTION_STATUSES,
  ROOM_TYPES,
  FREE_TIER_LIMITS,
  PREMIUM_TIER_LIMITS,
  PRICING,
  PAY_PER_USE,
  IAP_PRODUCT_IDS,
  REVENUECAT_PREMIUM_ENTITLEMENT,
  SHARE_LINK_CONFIG,
  PHOTO_CONFIG,
  VALIDATION_LIMITS,
  APP_CONFIG,
  type PropertyTypeValue,
  type InspectionStatusValue,
  type SubscriptionStatusValue,
  type RoomTypeValue,
} from './constants';

// Schema exports
export {
  propertySchema,
  propertyUpdateSchema,
  inspectionSchema,
  inspectionUpdateSchema,
  photoSchema,
  photoUpdateSchema,
  userProfileSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sendReportEmailSchema,
  formatZodError,
  safeParse,
  type PropertyInput,
  type PropertyUpdateInput,
  type InspectionInput,
  type InspectionUpdateInput,
  type PhotoInput,
  type PhotoUpdateInput,
  type UserProfileInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type SendReportEmailInput,
} from './schemas';

// Logo components
export { Logo, LogoWithText, LogoAppIcon } from './components/Logo';

// Province configuration
export {
  PROVINCES,
  PROVINCE_CODES,
  CASE_STUDIES,
  getProvince,
  getProvinceOptions,
  getCaseStudiesByProvince,
  type ProvinceConfig,
  type CaseStudy,
} from './provinces';
