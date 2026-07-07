import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-800';
  
  const variants = {
    text: 'h-4 w-full rounded',
    rect: 'w-full rounded-xl',
    circle: 'rounded-full flex-shrink-0',
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`rounded-full border-t-transparent border-brand-500 animate-spin ${sizes[size]} ${className}`}
      role="status"
    />
  );
};
