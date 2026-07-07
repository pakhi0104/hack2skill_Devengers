import React from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Optional gradient override; defaults to brand→purple */
  gradient?: string;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

/** Returns up to two initials from a display name */
function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
  gradient = 'from-brand-500 via-accent-purple to-accent-cyan',
  onClick,
}) => {
  const sizeClass = SIZE_CLASSES[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        onClick={onClick}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={name ? `Avatar for ${name}` : 'User avatar'}
      className={`
        ${sizeClass} rounded-full flex-shrink-0 select-none
        bg-gradient-to-tr ${gradient}
        flex items-center justify-center
        text-white font-bold shadow-md shadow-brand-500/10
        ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
};
