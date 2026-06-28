import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PropertyCheck — Protect Your Damage Deposit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background decorative circle */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -80,
            bottom: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Shield icon */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-1px',
            marginBottom: 16,
          }}
        >
          PropertyCheck
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Protect your damage deposit with professional rental inspection reports
        </div>

        {/* Canadian badge */}
        <div
          style={{
            marginTop: 40,
            padding: '10px 24px',
            borderRadius: 100,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 20 }}>🍁</div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            Built for Canadian Renters
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
