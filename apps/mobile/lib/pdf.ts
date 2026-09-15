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
import { fr } from 'date-fns/locale';
import qrcode from 'qrcode-generator';
import { InspectionWithPhotos } from './types';
import { buildPhotoDataUris, PDF_IMAGE_FALLBACK } from './pdfImages';
import { APP_CONFIG, getProvince, type ProvinceConfig } from '@propertycheck/shared';

// Room type configuration for grouping and display - with translations
const ROOM_CONFIG = {
  living_room: { label: { en: 'Living Areas', fr: 'Salon' }, order: 1, icon: '🏠' },
  kitchen: { label: { en: 'Kitchen', fr: 'Cuisine' }, order: 2, icon: '🍳' },
  bedroom: { label: { en: 'Bedrooms', fr: 'Chambres' }, order: 3, icon: '🛏️' },
  bathroom: { label: { en: 'Bathrooms', fr: 'Salles de bain' }, order: 4, icon: '🚿' },
  other: { label: { en: 'Other Areas', fr: 'Autres espaces' }, order: 5, icon: '📷' },
} as const;

// Inspection type labels with translations
const INSPECTION_TYPE_LABELS = {
  en: {
    'move-in': 'Move-In Inspection',
    'move-out': 'Move-Out Inspection',
    'routine': 'Routine Inspection',
    'draft': 'Inspection Report',
    'completed': 'Inspection Report',
  },
  fr: {
    'move-in': 'Inspection d\'emménagement',
    'move-out': 'Inspection de déménagement',
    'routine': 'Inspection de routine',
    'draft': 'Rapport d\'inspection',
    'completed': 'Rapport d\'inspection',
  },
} as const;

// PDF text translations
const PDF_TRANSLATIONS = {
  en: {
    propertyInspectionReport: 'Property Inspection Report',
    officialDocumentation: 'Official documentation of property condition',
    propertyAddress: 'Property Address',
    inspectionDateTime: 'Inspection Date & Time',
    renterName: 'Renter Name',
    inspectionStatus: 'Inspection Status',
    completed: 'Completed',
    inProgress: 'In Progress',
    inspectorNotes: 'Inspector Notes',
    photoDocumentation: 'Photo Documentation',
    timestampedPhotos: 'timestamped photo',
    timestampedPhotosPlural: 'timestamped photos',
    photo: 'Photo',
    photos: 'photos',
    noPhotosAttached: 'No photos attached to this inspection.',
    shareThisInspection: 'Share this inspection',
    scanToView: 'Scan to view online report or share with landlord',
    legalNotice: 'Legal Notice',
    shareNotice: 'Share this report with your landlord, property manager, or rental tribunal as proof of property condition.',
    reportGeneratedOn: 'Report generated on',
    at: 'at',
    watermarkText: 'Sample Copy',
  },
  fr: {
    propertyInspectionReport: 'Rapport d\'inspection de propriété',
    officialDocumentation: 'Documentation officielle de l\'état de la propriété',
    propertyAddress: 'Adresse de la propriété',
    inspectionDateTime: 'Date et heure de l\'inspection',
    renterName: 'Nom du locataire',
    inspectionStatus: 'Statut de l\'inspection',
    completed: 'Terminée',
    inProgress: 'En cours',
    inspectorNotes: 'Notes de l\'inspecteur',
    photoDocumentation: 'Documentation photographique',
    timestampedPhotos: 'photo horodatée',
    timestampedPhotosPlural: 'photos horodatées',
    photo: 'Photo',
    photos: 'photos',
    noPhotosAttached: 'Aucune photo jointe à cette inspection.',
    shareThisInspection: 'Partager cette inspection',
    scanToView: 'Scannez pour voir le rapport en ligne ou partager avec le propriétaire',
    legalNotice: 'Avis juridique',
    shareNotice: 'Partagez ce rapport avec votre propriétaire, gestionnaire immobilier ou tribunal des loyers comme preuve de l\'état de la propriété.',
    reportGeneratedOn: 'Rapport généré le',
    at: 'à',
    watermarkText: 'Copie Échantillon',
  },
} as const;

type Locale = 'en' | 'fr';

/**
 * Generate a QR code as an inline SVG string. Pure-JS (qrcode-generator, no
 * native module, no network) so the PDF renders fully offline — the old
 * implementation fetched the QR from api.qrserver.com at print time.
 */
function generateQRCodeSVG(url: string, size: number = 100): string {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  return `<div style="width: ${size}px; height: ${size}px;">${svg}</div>`;
}

/**
 * Get province-specific legal disclaimer text
 */
function getLegalDisclaimer(province: ProvinceConfig | undefined, locale: Locale = 'en'): string {
  if (!province) {
    return locale === 'fr'
      ? 'Ce rapport d\'inspection horodaté documente l\'état de la propriété au moment de l\'inspection. Il peut être utilisé comme preuve dans les litiges locatifs.'
      : 'This timestamped inspection report documents the property condition at the time of inspection. It may be used as evidence in rental disputes.';
  }

  const disclaimers: Record<string, Record<Locale, string>> = {
    ON: {
      en: `This timestamped inspection is legally defensible evidence under the ${province.tenancyAct}. It may be submitted to the ${province.disputeBody} as proof of property condition.`,
      fr: `Cette inspection horodatée constitue une preuve juridiquement recevable en vertu de la ${province.tenancyAct}. Elle peut être soumise au ${province.disputeBody} comme preuve de l'état de la propriété.`,
    },
    BC: {
      en: `This inspection documentation complies with ${province.tenancyAct} requirements. BC law requires condition inspections for security deposit claims. Submit to ${province.disputeBody} if needed.`,
      fr: `Cette documentation d'inspection est conforme aux exigences de la ${province.tenancyAct}. La loi de la C.-B. exige des inspections d'état pour les réclamations de dépôt de garantie. Soumettez au ${province.disputeBody} si nécessaire.`,
    },
    AB: {
      en: `This inspection report meets ${province.tenancyAct} requirements for security deposit documentation. May be submitted to ${province.disputeBody} for dispute resolution.`,
      fr: `Ce rapport d'inspection répond aux exigences de la ${province.tenancyAct} pour la documentation du dépôt de garantie. Peut être soumis au ${province.disputeBody} pour la résolution des litiges.`,
    },
    QC: {
      en: `This documented inspection may be presented to ${province.disputeBody} as proof of dwelling condition.`,
      fr: `Cette inspection documentée peut être présentée au ${province.disputeBody} comme preuve de l'état du logement.`,
    },
  };

  return disclaimers[province.code]?.[locale] || disclaimers.ON[locale];
}

/**
 * Get inspection type from inspection data
 * Priority: 1) explicit type passed, 2) notes keywords, 3) chronological position
 */
function getInspectionType(
  inspection: InspectionWithPhotos,
  isFirstInspection: boolean,
  explicitType?: string
): string {
  // If explicit type is passed, use it directly
  if (explicitType && ['move-in', 'move-out', 'routine'].includes(explicitType)) {
    return explicitType;
  }

  // If notes contain move-in/move-out keywords, use those
  const notes = (inspection.notes || '').toLowerCase();
  if (notes.includes('move-out') || notes.includes('moveout') || notes.includes('move out')) {
    return 'move-out';
  }
  if (notes.includes('move-in') || notes.includes('movein') || notes.includes('move in')) {
    return 'move-in';
  }

  // Otherwise, infer from chronological position (first inspection = move-in)
  return isFirstInspection ? 'move-in' : 'move-out';
}

export interface PDFOptions {
  renterName?: string;
  inspectionType?: 'move-in' | 'move-out' | 'routine';
  provinceCode?: string;
  shareUrl?: string;
  isFirstInspection?: boolean;
  isPremium?: boolean;
  locale?: 'en' | 'fr';
}

/**
 * Generate professional HTML content for the inspection report
 */
// Brand colors - Navy blue for premium tier (professional look)
const BRAND_COLORS = {
  primary: '#1e3a5f',      // Navy blue (Check)
  primaryDark: '#0f2744',
  primaryLight: '#2d4a6f',
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
  imageMap: Map<string, string>,
  options: PDFOptions = {}
): string {
  const {
    renterName,
    inspectionType: explicitType,
    provinceCode,
    shareUrl,
    isFirstInspection = true,
    isPremium = false,
    locale = 'en',
  } = options;

  // Get translations for current locale
  const t = PDF_TRANSLATIONS[locale];

  // Dates and times - use French Canadian format and locale if locale is fr
  const dateFormat = locale === 'fr' ? 'd MMMM yyyy' : 'MMMM d, yyyy';
  const dateLocale = locale === 'fr' ? { locale: fr } : undefined;
  const inspectionDate = format(new Date(inspection.inspection_date), dateFormat, dateLocale);
  const inspectionTime = format(new Date(inspection.inspection_date), 'HH:mm');
  const generatedDate = format(new Date(), dateFormat, dateLocale);
  const generatedTime = format(new Date(), 'HH:mm');

  // Determine inspection type - pass explicit type to function for validation
  const inspectionType = getInspectionType(inspection, isFirstInspection, explicitType);
  const inspectionTypeLabels = INSPECTION_TYPE_LABELS[locale];
  const inspectionTypeLabel =
    inspectionTypeLabels[inspectionType as keyof typeof inspectionTypeLabels] || (locale === 'fr' ? 'Rapport d\'inspection' : 'Inspection Report');

  // Province legal info
  const province = provinceCode ? getProvince(provinceCode) : undefined;
  const legalDisclaimer = getLegalDisclaimer(province, locale);

  // Group photos by room (room_label; fall back to the category label for legacy
  // photos). Each group keeps its category for icon + ordering.
  const roomGroups = new Map<
    string,
    { roomType: string; label: string; photos: typeof inspection.photos }
  >();
  inspection.photos.forEach((photo) => {
    const roomType = photo.room_type || 'other';
    const config = ROOM_CONFIG[roomType as keyof typeof ROOM_CONFIG];
    const label = photo.room_label || (config ? config.label[locale] : roomType);
    if (!roomGroups.has(label)) roomGroups.set(label, { roomType, label, photos: [] });
    roomGroups.get(label)!.photos.push(photo);
  });

  // Sort by category order, then by label (numeric — Bedroom 1 before Bedroom 2).
  const sortedGroups = Array.from(roomGroups.values()).sort((a, b) => {
    const orderA = ROOM_CONFIG[a.roomType as keyof typeof ROOM_CONFIG]?.order ?? 99;
    const orderB = ROOM_CONFIG[b.roomType as keyof typeof ROOM_CONFIG]?.order ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.label.localeCompare(b.label, undefined, { numeric: true });
  });

  // Generate photo sections grouped by room
  const photoSections = sortedGroups
    .map((group) => {
      const photos = group.photos;
      const roomLabel = group.label;

      const photoHtml = photos
        .map(
          (photo, index) => `
          <div class="photo-item">
            <div class="photo-wrapper">
              <img src="${imageMap.get(photo.storage_path) || PDF_IMAGE_FALLBACK}" alt="${photo.caption || roomLabel}" />
              <div class="photo-number">${index + 1}</div>
            </div>
            <div class="photo-meta">
              ${photo.caption ? `<p class="caption">${photo.caption}</p>` : `<p class="caption">${roomLabel} - ${t.photo} ${index + 1}</p>`}
            </div>
          </div>
        `
        )
        .join('');

      return `
        <div class="room-section">
          <div class="room-header">
            <h3>${roomLabel}</h3>
            <span class="photo-count">${photos.length} ${photos.length !== 1 ? t.photos : t.photo.toLowerCase()}</span>
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
          <p class="qr-label">${t.shareThisInspection}</p>
          <p class="qr-hint">${t.scanToView}</p>
        </div>
      </div>
    `
    : '';

  // Tier badge for header (only show for premium)
  const tierBadge = isPremium
    ? `<span class="tier-badge premium">Premium</span>`
    : '';

  // Free tier uses grayscale colors for a clean B&W look
  const FREE_COLORS = {
    primary: '#4a5568',
    primaryDark: '#2d3748',
    primaryLight: '#718096',
    dark: '#1a202c',
    gray: '#718096',
    lightGray: '#a0aec0',
    background: '#f7fafc',
    white: '#ffffff',
    success: '#4a5568',
    warning: '#718096',
    error: '#4a5568',
  };

  // Select color scheme based on tier
  const colors = isPremium ? BRAND_COLORS : FREE_COLORS;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${inspectionTypeLabel} - ${propertyAddress}</title>
      <style>
        :root {
          --primary: ${colors.primary};
          --primary-dark: ${colors.primaryDark};
          --ink: ${colors.dark};
          --gray: ${colors.gray};
          --muted: ${colors.lightGray};
          --bg: ${colors.background};
          --success: ${colors.success};
          --line: #e5e7eb;
          --line-strong: #cbd5e1;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page { size: letter; margin: 14mm 14mm 16mm 14mm; }

        html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10.5pt;
          line-height: 1.5;
          color: var(--ink);
          background: #ffffff;
        }

        .content-wrapper { }
        .main-content { }

        /* ---------- Header ---------- */
        .header {
          border-bottom: 2px solid var(--primary);
          padding-bottom: 18px;
          margin-bottom: 22px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .brand { display: flex; align-items: center; gap: 9px; }
        .logo { font-size: 16pt; font-weight: 800; letter-spacing: -0.4px; }
        .logo-property { color: var(--ink); }
        .logo-check { color: var(--primary); }
        .tier-badge {
          padding: 3px 8px;
          border: 1px solid var(--line-strong);
          border-radius: 4px;
          font-size: 7pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--gray);
          background: #fff;
        }
        .tier-badge.premium { color: var(--primary); border-color: var(--primary); }
        .tier-badge.free { color: var(--gray); }
        .badges { display: flex; }
        .inspection-badge {
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 8.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          border: 1px solid transparent;
        }
        .badge-move-in { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
        .badge-move-out { color: #92400e; background: #fffbeb; border-color: #fde68a; }
        .badge-routine { color: #3730a3; background: #eef2ff; border-color: #c7d2fe; }
        .badge-completed { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
        .badge-draft { color: var(--gray); background: #f8fafc; border-color: var(--line); }

        h1 {
          font-size: 21pt;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .subtitle { font-size: 10.5pt; color: var(--gray); }

        /* ---------- Meta grid (bordered, table-like) ---------- */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin-top: 18px;
          border: 1px solid var(--line);
          border-radius: 6px;
          overflow: hidden;
        }
        .info-item {
          padding: 12px 16px;
          border-top: 1px solid var(--line);
          border-right: 1px solid var(--line);
        }
        .info-item:nth-child(1), .info-item:nth-child(2) { border-top: none; }
        .info-item:nth-child(2n) { border-right: none; }
        .info-item.info-notes { grid-column: 1 / -1; border-right: none; }
        .info-label {
          display: block;
          font-size: 7.5pt;
          font-weight: 700;
          color: var(--gray);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 5px;
        }
        .info-value { font-size: 11pt; font-weight: 600; color: var(--ink); }
        .info-value.address { font-size: 11.5pt; color: var(--primary); }
        .info-notes .notes-text { font-weight: 400; font-style: italic; color: var(--gray); font-size: 10pt; }
        .status-row { display: flex; align-items: center; gap: 7px; margin-top: 2px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.completed { background: var(--success); }
        .status-dot.draft { background: #f59e0b; }

        /* ---------- Section heading ---------- */
        .photos-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--line-strong);
        }
        .photos-header h2 { font-size: 13pt; font-weight: 700; color: var(--ink); letter-spacing: -0.2px; }
        .photo-summary { font-size: 9pt; font-weight: 600; color: var(--gray); }

        /* ---------- Room ---------- */
        .room-section { margin-bottom: 20px; page-break-inside: avoid; }
        .room-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0 6px 12px;
          margin-bottom: 12px;
          border-left: 3px solid var(--primary);
        }
        .room-header h3 { font-size: 12pt; font-weight: 700; color: var(--ink); flex: 1; letter-spacing: -0.2px; }
        .photo-count { font-size: 8.5pt; font-weight: 600; color: var(--gray); white-space: nowrap; }

        /* ---------- Photo grid ---------- */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }
        .photo-item { break-inside: avoid; page-break-inside: avoid; }
        .photo-wrapper {
          position: relative;
          border: 1px solid var(--line-strong);
          border-radius: 4px;
          overflow: hidden;
          background: #f1f5f9;
        }
        .photo-item img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .photo-number {
          position: absolute;
          top: 7px;
          left: 7px;
          background: rgba(15, 23, 42, 0.82);
          color: #fff;
          font-size: 8pt;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photo-meta { padding: 6px 2px 0; }
        .caption { font-size: 8.5pt; color: var(--gray); line-height: 1.35; }

        /* ---------- Empty ---------- */
        .empty-photos {
          text-align: center;
          padding: 36px;
          border: 1px dashed var(--line-strong);
          border-radius: 6px;
          color: var(--gray);
        }

        /* ---------- QR ---------- */
        .qr-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 22px;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 6px;
          page-break-inside: avoid;
        }
        .qr-code { flex-shrink: 0; }
        .qr-text { flex: 1; }
        .qr-label { font-size: 11pt; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
        .qr-hint { font-size: 9pt; color: var(--gray); }

        /* ---------- Footer ---------- */
        .footer { margin-top: 26px; padding-top: 16px; border-top: 2px solid var(--primary); }
        .legal-notice {
          background: var(--bg);
          border-left: 3px solid var(--primary);
          padding: 12px 14px;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .legal-notice p { font-size: 8.5pt; color: #334155; line-height: 1.55; }
        .legal-notice strong { color: var(--ink); font-weight: 700; }
        .share-notice { font-size: 8.5pt; color: var(--gray); text-align: center; margin-bottom: 12px; font-style: italic; }
        .footer-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: var(--muted);
          border-top: 1px solid var(--line);
          padding-top: 10px;
        }
        .footer-brand { font-weight: 700; }
        .footer-brand .brand-property { color: var(--ink); }
        .footer-brand .brand-check { color: var(--primary); }

        @media print {
          .room-section, .photo-item, .qr-section { page-break-inside: avoid; }
        }
        .watermark {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-32deg);
          font-size: 90px;
          font-weight: 800;
          letter-spacing: 10px;
          color: rgba(15, 23, 42, 0.08);
          text-transform: uppercase;
          z-index: 9999;
          pointer-events: none;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>
    <body>
      ${isPremium ? '' : `<div class="watermark">${t.watermarkText}</div>`}

      <div class="content-wrapper">
      <div class="main-content">
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

        <h1>${t.propertyInspectionReport}</h1>
        <p class="subtitle">${t.officialDocumentation}</p>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">${t.propertyAddress}</span>
            <span class="info-value address">${propertyAddress}</span>
          </div>
          <div class="info-item">
            <span class="info-label">${t.inspectionDateTime}</span>
            <span class="info-value">${inspectionDate} ${t.at} ${inspectionTime}</span>
          </div>
          ${
            renterName
              ? `
          <div class="info-item">
            <span class="info-label">${t.renterName}</span>
            <span class="info-value">${renterName}</span>
          </div>
          `
              : ''
          }
          <div class="info-item">
            <span class="info-label">${t.inspectionStatus}</span>
            <div class="status-row">
              <span class="status-dot ${inspection.status}"></span>
              <span class="info-value">${inspection.status === 'completed' ? t.completed : t.inProgress}</span>
            </div>
          </div>
          ${
            inspection.notes
              ? `
          <div class="info-item info-notes">
            <span class="info-label">${t.inspectorNotes}</span>
            <span class="info-value notes-text">${inspection.notes}</span>
          </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- Photo Documentation -->
      <div class="photos-header">
        <h2>${t.photoDocumentation}</h2>
        <span class="photo-summary">${inspection.photos.length} ${inspection.photos.length !== 1 ? t.timestampedPhotosPlural : t.timestampedPhotos}</span>
      </div>

      ${
        photoSections ||
        `
        <div class="empty-photos">
          <p>${t.noPhotosAttached}</p>
        </div>
      `
      }

      ${qrCodeSection}
      </div><!-- end main-content -->

      <!-- Footer - pushed to bottom by flexbox -->
      <div class="footer">
        <div class="legal-notice">
          <p><strong>${t.legalNotice}:</strong> ${legalDisclaimer}</p>
        </div>

        <p class="share-notice">
          ${t.shareNotice}
        </p>

        <div class="footer-meta">
          <span>${t.reportGeneratedOn} ${generatedDate} ${t.at} ${generatedTime}</span>
          <span class="footer-brand"><span class="brand-property">Property</span><span class="brand-check">Check</span> &bull; ${APP_CONFIG.supportEmail}</span>
        </div>
      </div>
      </div><!-- end content-wrapper -->
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
  const imageMap = await buildPhotoDataUris(inspection.photos.map((p) => p.storage_path));
  const html = generateReportHtml(inspection, propertyAddress, imageMap, options);

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
    const imageMap = await buildPhotoDataUris(inspection.photos.map((p) => p.storage_path));
    const html = generateReportHtml(inspection, propertyAddress, imageMap, options);
    await Print.printAsync({ html });
    return { success: true, error: null };
  } catch (err) {
    console.error('Print error:', err);
    return { success: false, error: 'Failed to print report' };
  }
}
