import React from 'react';

const Card = ({
  children,
  className = '',
  elevated = false,
  noPadding = false,
  animate = false,
  onClick,
  ...props
}) => {
  const baseClasses = `
    rounded-[var(--radius-card)]
    border border-[#4d4635]
    transition-all duration-300 ease-out
    bg-gradient-to-b from-[#1b1b1c] to-[#131313]
    shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
    ${elevated ? 'shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]' : ''}
    ${noPadding ? '' : 'p-6'}
    ${animate ? 'animate-fade-in' : ''}
    ${onClick ? 'cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1' : ''}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
