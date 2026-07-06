import React from 'react';

const Chip = ({ children, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-[#2a2a2a] text-[#e5e2e1] shadow-[0_0_4px_rgba(0,0,0,0.3)]',
    gold: 'bg-[#2a2a2a] text-[#eac249] shadow-[0_0_8px_rgba(234,194,73,0.4),0_0_4px_rgba(234,194,73,0.2)]',
    blue: 'bg-[#2a2a2a] text-[#a5c8ff] shadow-[0_0_8px_rgba(165,200,255,0.4),0_0_4px_rgba(165,200,255,0.2)]',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-sm
        font-mono text-xs font-medium uppercase tracking-wider
        ${variantStyles[variant] || variantStyles.default}
      `}
    >
      {children}
    </span>
  );
};

export default Chip;
