import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * PropertyCheck Logo
 * A minimalist house frame with a key inside
 * Design: Clean, modern, professional - suitable for a property/real estate SaaS
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
      {/* House frame - simple pitched roof outline */}
      <path
        d="M24 4L4 20V44H44V20L24 4Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Roof peak accent */}
      <path
        d="M4 20L24 4L44 20"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Key - vertical orientation */}
      {/* Key head (circle with notch) */}
      <circle
        cx="24"
        cy="18"
        r="5"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />

      {/* Key shaft */}
      <path
        d="M24 23V36"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Key teeth */}
      <path
        d="M24 30H28"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 34H27"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Logo with text - for headers and branding
 */
export function LogoWithText({
  size = 32,
  color = 'currentColor',
  textColor,
  className = ''
}: LogoProps & { textColor?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} color={color} />
      <span
        className="font-bold text-lg"
        style={{ color: textColor || color }}
      >
        PropertyCheck
      </span>
    </div>
  );
}

/**
 * App Icon variant - filled background for app icons
 */
export function LogoAppIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background with rounded corners */}
      <rect width="512" height="512" rx="96" fill="#1a1a1a" />

      {/* House frame */}
      <path
        d="M256 96L96 224V416H416V224L256 96Z"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Roof accent */}
      <path
        d="M96 224L256 96L416 224"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Key head */}
      <circle
        cx="256"
        cy="192"
        r="40"
        stroke="white"
        strokeWidth="20"
        fill="none"
      />

      {/* Key shaft */}
      <path
        d="M256 232V352"
        stroke="white"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Key teeth */}
      <path
        d="M256 296H296"
        stroke="white"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M256 336H288"
        stroke="white"
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Logo;
