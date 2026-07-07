import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = true,
  hoverable = true,
  animate = true,
  ...props
}) => {
  const cardClasses = `
    rounded-2xl p-6 overflow-hidden transition-all duration-300 border
    ${glass 
      ? 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/20 dark:border-white/10 shadow-glass' 
      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}
    ${hoverable 
      ? 'hover:shadow-glass-hover hover:border-white/40 dark:hover:border-white/20' 
      : ''}
    ${className}
  `;

  if (animate) {
    return (
      <motion.div
        whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
        className={cardClasses}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};
