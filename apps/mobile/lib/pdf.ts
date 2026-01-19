/**
 * PDF Generation Utility
 *
 * Generates inspection reports as PDF files using expo-print.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { InspectionWithPhotos } from './types';
import { getPhotoUrl } from './storage';
import { APP_CONFIG } from '@propertycheck/shared';

/**
 * Generate HTML content for the inspection report
 */
function generateReportHtml(
  inspection: InspectionWithPhotos,
  propertyAddress: string
): string {
  const inspectionDate = format(
    new Date(inspection.inspection_date),
    'MMMM d, yyyy'
  );
  const createdDate = format(new Date(inspection.created_at), 'MMM d, yyyy');

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

  const roomLabels: Record<string, string> = {
    bedroom: 'Bedroom',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    living_room: 'Living Room',
    other: 'Other Areas',
  };

  // Generate photo sections
  const photoSections = Object.entries(photosByRoom)
    .map(([room, photos]) => {
      const photoHtml = photos
        .map(
          (photo) => `
        <div class="photo-item">
          <img src="${getPhotoUrl(photo.storage_path)}" alt="${photo.caption || room}" />
          ${photo.caption ? `<p class="caption">${photo.caption}</p>` : ''}
        </div>
      `
        )
        .join('');

      return `
      <div class="room-section">
        <h3>${roomLabels[room] || room}</h3>
        <div class="photo-grid">
          ${photoHtml}
        </div>
      </div>
    `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inspection Report - ${propertyAddress}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 40px;
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
        }
        .meta span {
          margin-right: 20px;
        }
        .section {
          margin-bottom: 30px;
        }
        h2 {
          font-size: 20px;
          color: #2563eb;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e5e5;
        }
        h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 10px;
        }
        .notes {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .room-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .photo-item {
          break-inside: avoid;
        }
        .photo-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e5e5;
        }
        .caption {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
          text-align: center;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-completed {
          background: #dcfce7;
          color: #166534;
        }
        .status-draft {
          background: #fef3c7;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${APP_CONFIG.name}</div>
        <h1>Property Inspection Report</h1>
        <div class="meta">
          <span><strong>Property:</strong> ${propertyAddress}</span>
          <span><strong>Date:</strong> ${inspectionDate}</span>
          <span class="status-badge ${inspection.status === 'completed' ? 'status-completed' : 'status-draft'}">
            ${inspection.status}
          </span>
        </div>
      </div>

      ${
        inspection.notes
          ? `
        <div class="section">
          <h2>Inspection Notes</h2>
          <div class="notes">
            <p>${inspection.notes}</p>
          </div>
        </div>
      `
          : ''
      }

      <div class="section">
        <h2>Photo Documentation</h2>
        <p style="color: #666; margin-bottom: 15px;">
          Total photos: ${inspection.photos.length}
        </p>
        ${photoSections || '<p>No photos attached to this inspection.</p>'}
      </div>

      <div class="footer">
        <p>Generated by ${APP_CONFIG.name} on ${createdDate}</p>
        <p>${APP_CONFIG.supportEmail}</p>
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
  propertyAddress: string
): Promise<string> {
  const html = generateReportHtml(inspection, propertyAddress);

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
  propertyAddress: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const uri = await generateInspectionPdf(inspection, propertyAddress);

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
  propertyAddress: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const html = generateReportHtml(inspection, propertyAddress);
    await Print.printAsync({ html });
    return { success: true, error: null };
  } catch (err) {
    console.error('Print error:', err);
    return { success: false, error: 'Failed to print report' };
  }
}
