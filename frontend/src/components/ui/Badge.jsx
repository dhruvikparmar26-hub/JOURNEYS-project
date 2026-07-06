import React from 'react';

const variantStyles = {
  gold: 'bg-accent-gold text-[#0d2e27]',
  blue: 'bg-accent-blue text-white',
  success: 'bg-[#e6f4ea] text-[#006d35]',
  danger: 'bg-[#fce8e6] text-[#ba1a1a]',
  warning: 'bg-[#fef7e0] text-[#b87a1e]',
  muted: 'bg-bg-elevated text-text-secondary border border-border/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const Badge = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-semibold
        rounded-[var(--radius-pill)]
        ${variantStyles[variant] || variantStyles.gold}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
