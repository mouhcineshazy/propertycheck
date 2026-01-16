/**
 * Zod Validation Schemas
 *
 * Shared validation schemas for forms and API inputs.
 * Use these in both mobile and web apps for consistent validation.
 */

import { z } from 'zod';
import {
  PROPERTY_TYPES,
  ROOM_TYPES,
  VALIDATION_LIMITS,
} from './constants';

// Extract room type values for the enum
const roomTypeValues = ROOM_TYPES.map((r) => r.value) as [string, ...string[]];

/**
 * Property Schemas
 */
export const propertySchema = z.object({
  address: z
    .string()
    .min(VALIDATION_LIMITS.address.min, `Address must be at least ${VALIDATION_LIMITS.address.min} characters`)
    .max(VALIDATION_LIMITS.address.max, `Address must be at most ${VALIDATION_LIMITS.address.max} characters`),
  property_type: z.enum(PROPERTY_TYPES, {
    errorMap: () => ({ message: 'Please select a property type' }),
  }),
  notes: z
    .string()
    .max(VALIDATION_LIMITS.notes.max, `Notes must be at most ${VALIDATION_LIMITS.notes.max} characters`)
    .optional()
    .nullable(),
});

export const propertyUpdateSchema = propertySchema.partial();

export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

/**
 * Inspection Schemas
 */
export const inspectionSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  notes: z
    .string()
    .max(VALIDATION_LIMITS.notes.max, `Notes must be at most ${VALIDATION_LIMITS.notes.max} characters`)
    .optional()
    .nullable(),
  inspection_date: z.string().datetime().optional(),
});

export const inspectionUpdateSchema = z.object({
  notes: z
    .string()
    .max(VALIDATION_LIMITS.notes.max)
    .optional()
    .nullable(),
  status: z.enum(['draft', 'completed']).optional(),
});

export type InspectionInput = z.infer<typeof inspectionSchema>;
export type InspectionUpdateInput = z.infer<typeof inspectionUpdateSchema>;

/**
 * Photo Schemas
 */
export const photoSchema = z.object({
  inspection_id: z.string().uuid('Invalid inspection ID'),
  storage_path: z.string().min(1, 'Storage path is required'),
  caption: z
    .string()
    .max(VALIDATION_LIMITS.caption.max, `Caption must be at most ${VALIDATION_LIMITS.caption.max} characters`)
    .optional()
    .nullable(),
  room_type: z.enum(roomTypeValues as [string, ...string[]]).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

export const photoUpdateSchema = z.object({
  caption: z.string().max(VALIDATION_LIMITS.caption.max).optional().nullable(),
  room_type: z.enum(roomTypeValues as [string, ...string[]]).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

export type PhotoInput = z.infer<typeof photoSchema>;
export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;

/**
 * User Profile Schema
 */
export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(VALIDATION_LIMITS.fullName.min, 'Name is required')
    .max(VALIDATION_LIMITS.fullName.max, `Name must be at most ${VALIDATION_LIMITS.fullName.max} characters`)
    .optional()
    .nullable(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

/**
 * Auth Schemas
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  full_name: z
    .string()
    .min(1, 'Name is required')
    .max(VALIDATION_LIMITS.fullName.max)
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Helper function to format Zod errors for display
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

/**
 * Safe parse helper that returns typed result
 */
export function safeParse<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: formatZodError(result.error) };
}
