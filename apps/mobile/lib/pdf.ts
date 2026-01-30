/**
 * PDF Generation Utility
 *
 * Generates professional, legally-defensible inspection reports as PDF files.
 * Features:
 * - Property details with timestamps
 * - Auto-grouped photos by room type
 * - Province-specific legal messaging
 * - QR code for shareable reports
 * - Professional typography and layout
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { InspectionWithPhotos } from './types';
import { getPhotoUrl } from './storage';
import { APP_CONFIG, getProvince, type ProvinceConfig } from '@propertycheck/shared';

// Room type configuration for grouping and display
const ROOM_CONFIG = {
  living_room: { label: 'Living Areas', order: 1, icon: '🏠' },
  kitchen: { label: 'Kitchen', order: 2, icon: '🍳' },
  bedroom: { label: 'Bedrooms', order: 3, icon: '🛏️' },
  bathroom: { label: 'Bathrooms', order: 4, icon: '🚿' },
  other: { label: 'Other Areas', order: 5, icon: '📷' },
} as const;

// Inspection type labels
const INSPECTION_TYPE_LABELS = {
  'move-in': 'Move-In Inspection',
  'move-out': 'Move-Out Inspection',
  'routine': 'Routine Inspection',
  'draft': 'Inspection Report',
  'completed': 'Inspection Report',
} as const;

/**
 * Generate a QR code as SVG for embedding in HTML
 * Using a simple QR code pattern generator
 */
function generateQRCodeSVG(url: string, size: number = 100): string {
  // For proper QR codes, we'd use a library, but for PDF we can use a web service
  // or encode a simple data URL pattern. Using Google Charts API as fallback.
  const encodedUrl = encodeURIComponent(url);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}" alt="QR Code" style="width: ${size}px; height: ${size}px;" />`;
}

/**
 * Get province-specific legal disclaimer text
 */
function getLegalDisclaimer(province: ProvinceConfig | undefined): string {
  if (!province) {
    return 'This timestamped inspection report documents the property condition at the time of inspection. It may be used as evidence in rental disputes.';
  }

  const disclaimers: Record<string, string> = {
    ON: `This timestamped inspection is legally defensible evidence under the ${province.tenancyAct}. It may be submitted to the ${province.disputeBody} as proof of property condition.`,
    BC: `This inspection documentation complies with ${province.tenancyAct} requirements. BC law requires condition inspections for security deposit claims. Submit to ${province.disputeBody} if needed.`,
    AB: `This inspection report meets ${province.tenancyAct} requirements for security deposit documentation. May be submitted to ${province.disputeBody} for dispute resolution.`,
    QC: `Cette inspection documentée peut être présentée au ${province.disputeBody} comme preuve de l'état du logement. / This documented inspection may be presented to ${province.disputeBody} as proof of dwelling condition.`,
  };

  return disclaimers[province.code] || disclaimers.ON;
}

/**
 * Get inspection type from inspection data
 */
function getInspectionType(inspection: InspectionWithPhotos, isFirstInspection: boolean): string {
  // If notes contain move-in/move-out keywords, use those
  const notes = (inspection.notes || '').toLowerCase();
  if (notes.includes('move-in') || notes.includes('movein')) return 'move-in';
  if (notes.includes('move-out') || notes.includes('moveout')) return 'move-out';

  // Otherwise, infer from position (first inspection is likely move-in)
  return isFirstInspection ? 'move-in' : 'move-out';
}

export interface PDFOptions {
  renterName?: string;
  inspectionType?: 'move-in' | 'move-out' | 'routine';
  provinceCode?: string;
  shareUrl?: string;
  isFirstInspection?: boolean;
  isPremium?: boolean;
}

/**
 * Generate professional HTML content for the inspection report
 */
// Brand colors - matching logo
const BRAND_COLORS = {
  primary: '#2563eb',      // Blue (Check)
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  dark: '#0f172a',         // Dark (Property)
  gray: '#64748b',
  lightGray: '#94a3b8',
  background: '#f8fafc',
  white: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

function generateReportHtml(
  inspection: InspectionWithPhotos,
  propertyAddress: string,
  options: PDFOptions = {}
): string {
  const {
    renterName,
    inspectionType: explicitType,
    provinceCode,
    shareUrl,
    isFirstInspection = true,
    isPremium = false,
  } = options;

  // Dates and times
  const inspectionDate = format(new Date(inspection.inspection_date), 'MMMM d, yyyy');
  const inspectionTime = format(new Date(inspection.inspection_date), 'h:mm a');
  const generatedDate = format(new Date(), 'MMMM d, yyyy');
  const generatedTime = format(new Date(), 'h:mm a');

  // Determine inspection type
  const inspectionType = explicitType || getInspectionType(inspection, isFirstInspection);
  const inspectionTypeLabel =
    INSPECTION_TYPE_LABELS[inspectionType as keyof typeof INSPECTION_TYPE_LABELS] || 'Inspection Report';

  // Province legal info
  const province = provinceCode ? getProvince(provinceCode) : undefined;
  const legalDisclaimer = getLegalDisclaimer(province);

  // Group photos by room type
  const photosByRoom = inspection.photos.reduce(
    (acc, photo) => {
      const room = photo.room_type || 'other';
      if (!acc[room]) acc[room] = [];
      acc[room].push(photo);
      return acc;
    },
    {} as Record<string, typeof inspection.photos>
  );

  // Sort rooms by configured order
  const sortedRooms = Object.keys(photosByRoom).sort((a, b) => {
    const orderA = ROOM_CONFIG[a as keyof typeof ROOM_CONFIG]?.order ?? 99;
    const orderB = ROOM_CONFIG[b as keyof typeof ROOM_CONFIG]?.order ?? 99;
    return orderA - orderB;
  });

  // Generate photo sections grouped by room
  const photoSections = sortedRooms
    .map((room) => {
      const photos = photosByRoom[room];
      const roomConfig = ROOM_CONFIG[room as keyof typeof ROOM_CONFIG] || { label: room, icon: '📷' };

      const photoHtml = photos
        .map(
          (photo, index) => `
          <div class="photo-item">
            <div class="photo-wrapper">
              <img src="${getPhotoUrl(photo.storage_path)}" alt="${photo.caption || roomConfig.label}" />
              <div class="photo-number">${index + 1}</div>
            </div>
            <div class="photo-meta">
              ${photo.caption ? `<p class="caption">${photo.caption}</p>` : `<p class="caption">${roomConfig.label} - Photo ${index + 1}</p>`}
            </div>
          </div>
        `
        )
        .join('');

      return `
        <div class="room-section">
          <div class="room-header">
            <span class="room-icon">${roomConfig.icon}</span>
            <h3>${roomConfig.label}</h3>
            <span class="photo-count">${photos.length} photo${photos.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="photo-grid">
            ${photoHtml}
          </div>
        </div>
      `;
    })
    .join('');

  // QR code section (if share URL provided)
  const qrCodeSection = shareUrl
    ? `
      <div class="qr-section">
        <div class="qr-code">
          ${generateQRCodeSVG(shareUrl, 80)}
        </div>
        <div class="qr-text">
          <p class="qr-label">Share this inspection</p>
          <p class="qr-hint">Scan to view online report or share with landlord</p>
        </div>
      </div>
    `
    : '';

  // Tier badge for header
  const tierBadge = isPremium
    ? `<span class="tier-badge premium">Premium</span>`
    : `<span class="tier-badge free">Free</span>`;

  // Watermark for free tier
  const watermarkStyles = !isPremium
    ? `
        body::before {
          content: 'FREE VERSION';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 100px;
          font-weight: 900;
          color: rgba(37, 99, 235, 0.06);
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
        }
      `
    : '';

  // Upgrade CTA for free tier
  const upgradeSection = !isPremium
    ? `
      <div class="upgrade-banner">
        <div class="upgrade-content">
          <div class="upgrade-icon">⭐</div>
          <div class="upgrade-text">
            <p class="upgrade-title">Upgrade to Premium</p>
            <p class="upgrade-desc">Remove watermark, get unlimited reports, and access comparison features</p>
          </div>
        </div>
        <div class="upgrade-url">propertycheck.app/upgrade</div>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${inspectionTypeLabel} - ${propertyAddress}</title>
      <style>
        /* Reset and base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @page {
          margin: 0.75in;
          size: letter;
        }

        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: ${BRAND_COLORS.dark};
          background: ${BRAND_COLORS.white};
        }

        ${watermarkStyles}

        /* Header Section */
        .header {
          border-bottom: 4px solid ${BRAND_COLORS.primary};
          padding-bottom: 24px;
          margin-bottom: 28px;
          ${isPremium ? `background: linear-gradient(135deg, ${BRAND_COLORS.background} 0%, ${BRAND_COLORS.white} 100%); margin: -20px -20px 28px -20px; padding: 20px 20px 24px 20px;` : ''}
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          font-size: 22pt;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-property {
          color: ${BRAND_COLORS.dark};
        }

        .logo-check {
          color: ${BRAND_COLORS.primary};
        }

        .tier-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tier-badge.premium {
          background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
          color: ${BRAND_COLORS.white};
        }

        .tier-badge.free {
          background: ${BRAND_COLORS.background};
          color: ${BRAND_COLORS.gray};
          border: 1px solid #e2e8f0;
        }

        .badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .inspection-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 9pt;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-move-in {
          background: #dcfce7;
          color: #166534;
        }

        .badge-move-out {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-routine {
          background: #e0e7ff;
          color: #3730a3;
        }

        .badge-completed {
          background: #dcfce7;
          color: #166534;
        }

        .badge-draft {
          background: #f5f5f5;
          color: ${BRAND_COLORS.gray};
        }

        h1 {
          font-size: 24pt;
          font-weight: 700;
          color: ${BRAND_COLORS.dark};
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 11pt;
          color: ${BRAND_COLORS.gray};
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          background: ${isPremium ? BRAND_COLORS.white : BRAND_COLORS.background};
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          ${isPremium ? `border: 2px solid ${BRAND_COLORS.primary}20; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);` : ''}
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 8pt;
          font-weight: 600;
          color: ${BRAND_COLORS.gray};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 11pt;
          font-weight: 500;
          color: ${BRAND_COLORS.dark};
        }

        .info-value.address {
          font-size: 12pt;
          font-weight: 600;
          color: ${isPremium ? BRAND_COLORS.primary : BRAND_COLORS.dark};
        }

        /* Status indicator */
        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.completed {
          background: ${BRAND_COLORS.success};
        }

        .status-dot.draft {
          background: ${BRAND_COLORS.warning};
        }

        /* Notes Section */
        .notes-section {
          background: ${isPremium ? '#eff6ff' : '#fffbeb'};
          border-left: 4px solid ${isPremium ? BRAND_COLORS.primary : BRAND_COLORS.warning};
          padding: 16px 20px;
          border-radius: 0 12px 12px 0;
          margin-bottom: 28px;
        }

        .notes-section h2 {
          font-size: 10pt;
          font-weight: 600;
          color: ${isPremium ? BRAND_COLORS.primaryDark : '#92400e'};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .notes-section p {
          font-size: 11pt;
          color: ${BRAND_COLORS.dark};
          line-height: 1.6;
        }

        /* Photo Documentation */
        .photos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 3px solid ${isPremium ? BRAND_COLORS.primary : '#e5e5e5'};
        }

        .photos-header h2 {
          font-size: 14pt;
          font-weight: 700;
          color: ${BRAND_COLORS.dark};
        }

        .photo-summary {
          font-size: 10pt;
          color: ${isPremium ? BRAND_COLORS.white : BRAND_COLORS.gray};
          background: ${isPremium ? BRAND_COLORS.primary : '#f5f5f5'};
          padding: 6px 14px;
          border-radius: 16px;
          font-weight: ${isPremium ? '600' : '400'};
        }

        /* Room Section */
        .room-section {
          margin-bottom: 28px;
          page-break-inside: avoid;
        }

        .room-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          padding: 12px 16px;
          background: ${isPremium ? `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)` : '#f0f9ff'};
          border-radius: 10px;
          ${isPremium ? `border-left: 4px solid ${BRAND_COLORS.primary};` : ''}
        }

        .room-icon {
          font-size: 18pt;
        }

        .room-header h3 {
          font-size: 13pt;
          font-weight: 600;
          color: ${BRAND_COLORS.primaryDark};
          flex: 1;
        }

        .photo-count {
          font-size: 9pt;
          color: ${BRAND_COLORS.gray};
          background: ${BRAND_COLORS.white};
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 500;
        }

        /* Photo Grid */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .photo-item {
          break-inside: avoid;
        }

        .photo-wrapper {
          position: relative;
          border-radius: ${isPremium ? '12px' : '8px'};
          overflow: hidden;
          border: ${isPremium ? `2px solid ${BRAND_COLORS.primary}30` : '1px solid #e5e5e5'};
          ${isPremium ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);' : ''}
        }

        .photo-item img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .photo-number {
          position: absolute;
          top: 8px;
          left: 8px;
          background: ${isPremium ? BRAND_COLORS.primary : 'rgba(0, 0, 0, 0.7)'};
          color: ${BRAND_COLORS.white};
          font-size: 9pt;
          font-weight: 600;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .photo-meta {
          padding: 10px 4px;
        }

        .caption {
          font-size: 9pt;
          color: ${BRAND_COLORS.gray};
          line-height: 1.4;
        }

        /* Empty state */
        .empty-photos {
          text-align: center;
          padding: 40px;
          background: ${BRAND_COLORS.background};
          border-radius: 12px;
          color: ${BRAND_COLORS.gray};
        }

        /* QR Code Section */
        .qr-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding: 16px;
          background: ${isPremium ? `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)` : '#f0f9ff'};
          border-radius: 12px;
          border: 1px solid ${isPremium ? BRAND_COLORS.primary + '40' : '#bae6fd'};
        }

        .qr-code {
          flex-shrink: 0;
        }

        .qr-text {
          flex: 1;
        }

        .qr-label {
          font-size: 11pt;
          font-weight: 600;
          color: ${BRAND_COLORS.primaryDark};
          margin-bottom: 2px;
        }

        .qr-hint {
          font-size: 9pt;
          color: ${BRAND_COLORS.gray};
        }

        /* Upgrade Banner (Free tier only) */
        .upgrade-banner {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 2px dashed #f59e0b;
        }

        .upgrade-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .upgrade-icon {
          font-size: 28pt;
        }

        .upgrade-text {
          flex: 1;
        }

        .upgrade-title {
          font-size: 13pt;
          font-weight: 700;
          color: ${BRAND_COLORS.dark};
          margin-bottom: 4px;
        }

        .upgrade-desc {
          font-size: 10pt;
          color: #92400e;
        }

        .upgrade-url {
          margin-top: 12px;
          text-align: center;
          font-size: 11pt;
          font-weight: 600;
          color: ${BRAND_COLORS.primary};
          background: ${BRAND_COLORS.white};
          padding: 8px 16px;
          border-radius: 8px;
        }

        /* Footer */
        .footer {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 3px solid ${isPremium ? BRAND_COLORS.primary : '#e5e5e5'};
        }

        .legal-notice {
          background: ${BRAND_COLORS.background};
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          ${isPremium ? `border-left: 4px solid ${BRAND_COLORS.primary};` : ''}
        }

        .legal-notice p {
          font-size: 9pt;
          color: ${BRAND_COLORS.gray};
          line-height: 1.5;
        }

        .legal-notice strong {
          color: ${BRAND_COLORS.dark};
          font-weight: 600;
        }

        .share-notice {
          font-size: 9pt;
          color: ${BRAND_COLORS.gray};
          text-align: center;
          margin-bottom: 12px;
          font-style: italic;
        }

        .footer-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: ${BRAND_COLORS.lightGray};
        }

        .footer-brand {
          font-weight: 700;
        }

        .footer-brand .brand-property {
          color: ${BRAND_COLORS.dark};
        }

        .footer-brand .brand-check {
          color: ${BRAND_COLORS.primary};
        }

        /* Print optimizations */
        @media print {
          .room-section {
            page-break-inside: avoid;
          }

          .photo-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="header-top">
          <div class="brand">
            <span class="logo"><span class="logo-property">Property</span><span class="logo-check">Check</span></span>
            ${tierBadge}
          </div>
          <div class="badges">
            <span class="inspection-badge badge-${inspectionType}">
              ${inspectionTypeLabel}
            </span>
          </div>
        </div>

        <h1>Property Inspection Report</h1>
        <p class="subtitle">Official documentation of property condition</p>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Property Address</span>
            <span class="info-value address">${propertyAddress}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Inspection Date & Time</span>
            <span class="info-value">${inspectionDate} at ${inspectionTime}</span>
          </div>
          ${
            renterName
              ? `
          <div class="info-item">
            <span class="info-label">Renter Name</span>
            <span class="info-value">${renterName}</span>
          </div>
          `
              : ''
          }
          <div class="info-item">
            <span class="info-label">Inspection Status</span>
            <div class="status-row">
              <span class="status-dot ${inspection.status}"></span>
              <span class="info-value">${inspection.status === 'completed' ? 'Completed' : 'In Progress'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      ${
        inspection.notes
          ? `
        <div class="notes-section">
          <h2>Inspector Notes</h2>
          <p>${inspection.notes}</p>
        </div>
      `
          : ''
      }

      <!-- Photo Documentation -->
      <div class="photos-header">
        <h2>Photo Documentation</h2>
        <span class="photo-summary">${inspection.photos.length} timestamped photo${inspection.photos.length !== 1 ? 's' : ''}</span>
      </div>

      ${
        photoSections ||
        `
        <div class="empty-photos">
          <p>No photos attached to this inspection.</p>
        </div>
      `
      }

      ${qrCodeSection}

      ${upgradeSection}

      <!-- Footer -->
      <div class="footer">
        <div class="legal-notice">
          <p><strong>Legal Notice:</strong> ${legalDisclaimer}</p>
        </div>

        <p class="share-notice">
          Share this report with your landlord, property manager, or rental tribunal as proof of property condition.
        </p>

        <div class="footer-meta">
          <span>Report generated on ${generatedDate} at ${generatedTime}</span>
          <span class="footer-brand"><span class="brand-property">Property</span><span class="brand-check">Check</span> &bull; ${APP_CONFIG.supportEmail}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate inspection PDF and return file URI
 */
export async function generateInspectionPdf(
  inspection: InspectionWithPhotos,
  propertyAddress: string,
  options?: PDFOptions
): Promise<string> {
  const html = generateReportHtml(inspection, propertyAddress, options);

  // Generate PDF
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return uri;
}

/**
 * Generate and share inspection PDF
 */
export async function generateAndShareInspectionPdf(
  inspection: InspectionWithPhotos,
  propertyAddress: string,
  options?: PDFOptions
): Promise<{ success: boolean; error: string | null }> {
  try {
    const uri = await generateInspectionPdf(inspection, propertyAddress, options);

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'Sharing is not available on this device' };
    }

    // Share the PDF
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Inspection Report',
      UTI: 'com.adobe.pdf',
    });

    return { success: true, error: null };
  } catch (err) {
    console.error('PDF generation error:', err);
    return { success: false, error: 'Failed to generate PDF' };
  }
}

/**
 * Print inspection report directly
 */
export async function printInspectionReport(
  inspection: InspectionWithPhotos,
  propertyAddress: string,
  options?: PDFOptions
): Promise<{ success: boolean; error: string | null }> {
  try {
    const html = generateReportHtml(inspection, propertyAddress, options);
    await Print.printAsync({ html });
    return { success: true, error: null };
  } catch (err) {
    console.error('Print error:', err);
    return { success: false, error: 'Failed to print report' };
  }
}
