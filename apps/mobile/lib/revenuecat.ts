/**
 * RevenueCat In-App Purchase wrapper.
 *
 * On mobile, digital goods MUST be sold through native IAP (Apple Guideline 3.1.1 /
 * Google Play Payments policy) — Stripe web checkout gets the app rejected.
 * RevenueCat manages receipt validation and renewal/refund state; its webhook
 * (supabase/functions/revenuecat-webhook) is the SOURCE OF TRUTH for entitlements
 * and writes the same Supabase rows the Stripe webhook did (report_unlocked,
 * bundle_purchases, subscriptions). This module only starts a purchase — it never
 * grants access itself.
 *
 * Product IDs and the premium entitlement id live in @propertycheck/shared so the
 * app and the webhook agree on a single mapping.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases';
import { IAP_PRODUCT_IDS, REVENUECAT_PREMIUM_ENTITLEMENT } from '@propertycheck/shared';

const extra = Constants.expoConfig?.extra ?? {};

// RevenueCat has no supported web path here; guard every entry point.
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

const apiKey = Platform.select({
  ios: extra.revenueCatIosKey as string | undefined,
  android: extra.revenueCatAndroidKey as string | undefined,
});

export type PurchaseResult =
  | { status: 'success'; customerInfo: CustomerInfo }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

let configured = false;

export function isRevenueCatReady(): boolean {
  return configured;
}

/**
 * Configure the SDK once at app start. Safe to call repeatedly. No-op on web or
 * when the platform API key is missing (e.g. local dev without keys) so the app
 * still runs — purchases just return a friendly error until keys are set.
 */
export function configureRevenueCat(): void {
  if (configured || !isNative || !apiKey) return;
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  Purchases.configure({ apiKey });
  configured = true;
}

/** Tie RevenueCat's identity to the Supabase user id so the webhook can match rows. */
export async function identifyRevenueCatUser(supabaseUserId: string): Promise<void> {
  if (!configured) configureRevenueCat();
  if (!configured) return;
  try {
    await Purchases.logIn(supabaseUserId);
  } catch (e) {
    console.warn('[revenuecat] logIn failed', e);
  }
}

export async function logOutRevenueCat(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn('[revenuecat] logOut failed', e);
  }
}

function unavailable(): PurchaseResult {
  return { status: 'error', message: 'In-app purchases are not available on this device.' };
}

function toResult(err: unknown): PurchaseResult {
  if (
    err &&
    typeof err === 'object' &&
    'userCancelled' in err &&
    (err as { userCancelled?: boolean }).userCancelled
  ) {
    return { status: 'cancelled' };
  }
  return { status: 'error', message: err instanceof Error ? err.message : 'Purchase failed' };
}

async function purchaseByProductId(productId: string): Promise<PurchaseResult> {
  if (!configured) configureRevenueCat();
  if (!configured) return unavailable();
  try {
    const [product] = await Purchases.getProducts([productId]);
    if (!product) {
      return { status: 'error', message: 'This product is not available. Please try again later.' };
    }
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    return { status: 'success', customerInfo };
  } catch (e) {
    return toResult(e);
  }
}

/**
 * Buy a one-time consumable (report unlock / moving bundle). The `contextId`
 * (inspection or property id) is attached as a subscriber attribute so the
 * RevenueCat webhook knows which row to grant. The webhook — not this call — is
 * the source of truth for the entitlement. A user buys one item at a time, so the
 * single attribute slot is safe.
 */
async function purchaseConsumable(productId: string, contextId: string): Promise<PurchaseResult> {
  if (!configured) configureRevenueCat();
  if (!configured) return unavailable();
  try {
    await Purchases.setAttributes({ pc_context_id: contextId });
  } catch (e) {
    console.warn('[revenuecat] setAttributes failed', e);
  }
  return purchaseByProductId(productId);
}

export function purchaseReportUnlock(inspectionId: string): Promise<PurchaseResult> {
  return purchaseConsumable(IAP_PRODUCT_IDS.report, inspectionId);
}

export function purchaseMovingBundle(propertyId: string): Promise<PurchaseResult> {
  return purchaseConsumable(IAP_PRODUCT_IDS.bundle, propertyId);
}

export function purchasePremium(billingCycle: 'monthly' | 'annual'): Promise<PurchaseResult> {
  return purchaseByProductId(
    billingCycle === 'annual' ? IAP_PRODUCT_IDS.premiumAnnual : IAP_PRODUCT_IDS.premiumMonthly
  );
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!configured) configureRevenueCat();
  if (!configured) return unavailable();
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { status: 'success', customerInfo };
  } catch (e) {
    return toResult(e);
  }
}

export function hasActivePremium(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[REVENUECAT_PREMIUM_ENTITLEMENT] !== undefined;
}
