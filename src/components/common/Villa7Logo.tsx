import React from 'react';

interface Villa7LogoProps {
  variant?: 'full' | 'icon' | 'stacked' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  iconColor?: string;
  textColor?: string;
}

/**
 * Villa7 Icon Component (VILLA7 ÁLBUNS Emblem)
 * Vector recreation based on official brand logotype.
 */
export const Villa7Icon: React.FC<{
  className?: string;
  color?: string;
  size?: number | string;
}> = ({ className = 'w-10 h-10', color = '#9E8668', size }) => {
  const style = size ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size } : undefined;

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Villa7 Álbuns Icone"
    >
      {/* Background soft sheen (optional/transparent) */}

      {/* Outer book frame - Left page */}
      {/* Top curved pages of open book */}
      <path
        d="M60 28 C45 22, 30 22, 14 26"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 28 C75 22, 90 22, 106 26"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Center spine */}
      <path
        d="M60 28 L60 88"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left Cover Frame */}
      <path
        d="M14 26 L14 88 L55 88"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* Inner L shape on left page */}
      <path
        d="M26 38 L26 78 L52 78"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="square"
      />

      {/* Stylized '7' on right page */}
      {/* Top bar of 7 */}
      <path
        d="M64 36 L100 30"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="square"
      />

      {/* Diagonal bold stroke of 7 */}
      <path
        d="M100 30 L64 88"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="square"
      />

      {/* Right page bottom & outer vertical accent */}
      <path
        d="M106 44 L106 88 L72 88"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="square"
      />
    </svg>
  );
};

/**
 * Villa7 Full Logotype Component
 */
export const Villa7Logo: React.FC<Villa7LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  iconColor = '#9E8668',
  textColor = '#2C2420',
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (variant === 'icon') {
    return <Villa7Icon color={iconColor} className={`${currentSizeClass} w-auto ${className}`} />;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <Villa7Icon color={iconColor} className="w-16 h-16" />
        <div className="flex flex-col items-center">
          <span
            className="font-serif tracking-[0.25em] font-normal text-2xl uppercase"
            style={{ color: textColor }}
          >
            V I L L A 7
          </span>
          <div className="flex items-center gap-2 w-full justify-center mt-0.5">
            <span className="h-[1px] w-6 bg-[#9E8668]/60" />
            <span
              className="font-sans text-[11px] uppercase tracking-[0.4em] font-light"
              style={{ color: iconColor }}
            >
              Á L B U N S
            </span>
            <span className="h-[1px] w-6 bg-[#9E8668]/60" />
          </div>
        </div>
      </div>
    );
  }

  // Default: Full Horizontal Logo (matching image 1000207068.png)
  return (
    <div className={`flex items-center gap-3.5 select-none ${currentSizeClass} ${className}`}>
      {/* Brand Icon */}
      <Villa7Icon color={iconColor} className="h-full w-auto shrink-0" />

      {/* Thin Vertical Line Divider */}
      <div className="h-[75%] w-[1px] bg-[#9E8668]/50 shrink-0" />

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-serif tracking-[0.22em] font-normal text-lg sm:text-xl uppercase"
          style={{ color: textColor }}
        >
          V I L L A 7
        </span>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="h-[1px] w-4 bg-[#9E8668]/60" />
          <span
            className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.35em] font-light"
            style={{ color: iconColor }}
          >
            Á L B U N S
          </span>
          <span className="h-[1px] w-4 bg-[#9E8668]/60" />
        </div>
      </div>
    </div>
  );
};
