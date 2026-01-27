/**
 * PropertyCheck Logo System - Web
 *
 * Text-only branding - "PropertyCheck"
 */

// Brand colors
const BRAND = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  dark: '#0f172a',
  gray: '#64748b',
  lightGray: '#94a3b8',
  white: '#ffffff',
};

interface LogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  variant?: 'default' | 'light' | 'dark';
}

// Map named sizes to font sizes
const NAMED_SIZES: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

// Get font size from size prop (handles both number and string)
function getFontSize(size: number | string): number {
  if (typeof size === 'number') {
    // If number provided, use it directly as font size basis
    return size * 0.5;
  }
  return NAMED_SIZES[size] || 24;
}

/**
 * Primary Logo - Text only
 */
export function Logo({ size = 'md', color, className = '', variant = 'default' }: LogoProps) {
  const textColor = color || (variant === 'light' ? BRAND.white : BRAND.dark);
  const fontSize = getFontSize(size);

  return (
    <span
      className={`font-bold tracking-tight ${className}`}
      style={{ color: textColor, fontSize }}
    >
      Property<span className="font-extrabold" style={{ color: BRAND.primary }}>Check</span>
    </span>
  );
}

/**
 * Logo for Splash/Hero - Large version
 */
export function LogoSplash({ size = 120, className = '' }: { size?: number; className?: string }) {
  const fontSize = size * 0.35;

  return (
    <span
      className={`font-bold tracking-tight ${className}`}
      style={{ fontSize, color: BRAND.dark }}
    >
      Property<span className="font-extrabold" style={{ color: BRAND.primary }}>Check</span>
    </span>
  );
}

/**
 * Logo with Tagline
 */
export function LogoWithTagline({
  size = 'md',
  color,
  className = '',
  variant = 'default',
}: LogoProps) {
  const textColor = color || (variant === 'light' ? BRAND.white : BRAND.dark);
  const taglineColor = variant === 'light' ? 'rgba(255,255,255,0.7)' : BRAND.gray;
  const fontSize = getFontSize(size);

  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className="font-bold tracking-tight"
        style={{ color: textColor, fontSize }}
      >
        Property<span className="font-extrabold" style={{ color: BRAND.primary }}>Check</span>
      </span>
      <span className="text-sm font-medium mt-1" style={{ color: taglineColor }}>
        Protect Your Deposit
      </span>
    </div>
  );
}

/**
 * Logo with Text - Horizontal layout with optional tagline
 */
export function LogoWithText({
  size = 'md',
  textColor = BRAND.dark,
  className = '',
  showTagline = false,
}: {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  className?: string;
  showTagline?: boolean;
}) {
  return showTagline ? (
    <LogoWithTagline size={size} color={textColor} className={className} />
  ) : (
    <Logo size={size} color={textColor} className={className} />
  );
}

/**
 * Stacked Logo - Vertical layout with tagline
 */
export function LogoStacked({
  size = 'lg',
  textColor = BRAND.dark,
  className = '',
  showTagline = true,
}: {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  className?: string;
  showTagline?: boolean;
}) {
  const fontSize = getFontSize(size);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <span
        className="font-bold tracking-tight"
        style={{ color: textColor, fontSize }}
      >
        Property<span className="font-extrabold" style={{ color: BRAND.primary }}>Check</span>
      </span>
      {showTagline && (
        <span className="text-sm font-medium" style={{ color: BRAND.gray }}>
          Protect Your Deposit
        </span>
      )}
    </div>
  );
}

/**
 * Footer Logo - Simplified for footers
 */
export function LogoFooter({ className = '' }: { className?: string }) {
  return (
    <span className={`text-sm font-semibold text-slate-500 ${className}`}>
      Property<span className="font-bold text-blue-600">Check</span>
    </span>
  );
}

// Backward compatibility exports
export const LogoIcon = Logo;
export const LogoMark = Logo;
export const LogoOutline = Logo;
export const AppIcon = Logo;

export { BRAND };

export default Logo;
