import React from 'react';

const colorStyles = {
  primary: {
    dot: 'bg-[#c8c6c5]',
    bg: 'bg-[#c8c6c5]/15',
    text: 'text-[#c8c6c5]',
    ring: 'ring-[#c8c6c5]/15',
  },
  secondary: {
    dot: 'bg-[#eac249]',
    bg: 'bg-[#eac249]/10',
    text: 'text-[#eac249]',
    ring: 'ring-[#eac249]/15',
  },
  blue: {
    dot: 'bg-[#a5c8ff]',
    bg: 'bg-[#a5c8ff]/10',
    text: 'text-[#a5c8ff]',
    ring: 'ring-[#a5c8ff]/15',
  },
  success: {
    dot: 'bg-[#3BC48A]',
    bg: 'bg-[#3BC48A]/10',
    text: 'text-[#3BC48A]',
    ring: 'ring-[#3BC48A]/15',
  },
  danger: {
    dot: 'bg-[#ffb4ab]',
    bg: 'bg-[#ffb4ab]/10',
    text: 'text-[#ffb4ab]',
    ring: 'ring-[#ffb4ab]/15',
  },
  info: {
    dot: 'bg-[#a5c8ff]',
    bg: 'bg-[#a5c8ff]/10',
    text: 'text-[#a5c8ff]',
    ring: 'ring-[#a5c8ff]/15',
  },
};

const StatusPill = ({
  label = 'Live',
  color = 'primary',
  pulsing = true,
  className = '',
  ...props
}) => {
  const styles = colorStyles[color] || colorStyles.primary;

  return (
    <span
      className={`
        inline-flex items-center gap-2
        px-3 py-1 rounded-[var(--radius-pill)]
        ${styles.bg} ${styles.text}
        ring-1 ${styles.ring}
        text-xs font-bold
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          w-2 h-2 rounded-full ${styles.dot}
          ${pulsing ? 'animate-pulse-dot' : ''}
        `}
      />
      {label}
    </span>
  );
};

export default StatusPill;
