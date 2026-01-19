interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * PropertyCheck Logo - Professional Design
 *
 * Concept: A modern shield shape containing a house silhouette with a checkmark,
 * representing property protection and verification.
 *
 * Design principles:
 * - Geometric precision with golden ratio proportions
 * - Negative space creates the house form
 * - Integrated checkmark conveys trust and verification
 * - Works at all sizes (favicon to billboard)
 */
export function Logo({ size = 32, color = 'currentColor', className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield/House combined shape */}
      <path
        d="M24 2L6 10V22C6 33.1 13.8 43.3 24 46C34.2 43.3 42 33.1 42 22V10L24 2Z"
        fill={color}
      />

      {/* House cutout (negative space) */}
      <path
        d="M24 12L14 19V34H20V26H28V34H34V19L24 12Z"
        fill="white"
      />

      {/* Checkmark inside house */}
      <path
        d="M19 24L22.5 27.5L29 21"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Alternate Logo - Minimal Line Version
 * For use on dark backgrounds or when a lighter touch is needed
 */
export function LogoOutline({ size = 32, color = 'currentColor', className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M24 4L8 11V21C8 31.2 14.9 40.4 24 43C33.1 40.4 40 31.2 40 21V11L24 4Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* House roof */}
      <path
        d="M15 22L24 15L33 22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* House body */}
      <path
        d="M17 21V32H31V21"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Door */}
      <path
        d="M22 32V26H26V32"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Logomark only - Square version for app icons
 */
export function LogoMark({ size = 32, color = 'currentColor', className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        fill={color}
      />

      {/* House icon */}
      <path
        d="M24 14L13 22V35H19V28H29V35H35V22L24 14Z"
        fill="white"
      />

      {/* Small checkmark badge */}
      <circle cx="35" cy="13" r="7" fill="#22c55e" />
      <path
        d="M32 13L34 15L38 11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoWithTextProps extends LogoProps {
  textColor?: string;
  variant?: 'default' | 'stacked';
}

export function LogoWithText({
  size = 32,
  color = 'currentColor',
  textColor,
  className = '',
  variant = 'default'
}: LogoWithTextProps) {
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <Logo size={size * 1.5} color={color} />
        <span
          className="font-semibold tracking-tight"
          style={{
            color: textColor || color,
            fontSize: size * 0.5
          }}
        >
          PropertyCheck
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} color={color} />
      <span
        className="font-semibold tracking-tight"
        style={{
          color: textColor || color,
          fontSize: size * 0.6
        }}
      >
        PropertyCheck
      </span>
    </div>
  );
}

export default Logo;
