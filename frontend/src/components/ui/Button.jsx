import React from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary: `
    bg-gradient-to-b from-[#eac249] to-[#af8d11]
    text-[#3d2f00] font-bold
    shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
    hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]
    active:bg-gradient-to-b active:from-[#af8d11] active:to-[#eac249]
    active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]
    active:translate-y-1
  `,
  secondary: `
    bg-gradient-to-b from-[#2a2a2a] to-[#1b1b1c]
    text-[#e5e2e1] font-bold
    border border-[#4d4635]
    shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]
    hover:bg-gradient-to-b hover:from-[#353535] hover:to-[#2a2a2a]
    active:bg-gradient-to-b active:from-[#1b1b1c] active:to-[#131313]
    active:translate-y-1
  `,
  ai: `
    bg-gradient-to-b from-[#d4e3ff] to-[#a5c8ff]
    text-[#00315e] font-bold
    border-t border-[#d4e3ff]/30
    border-b border-[#007ee6]
    shadow-[0_2px_4px_rgba(0,0,0,0.4)]
    hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]
    active:bg-gradient-to-b active:from-[#a5c8ff] active:to-[#007ee6]
    active:translate-y-1
  `,
  ghost: `
    bg-transparent text-[#8e9192] font-semibold
    hover:text-[#e5e2e1] hover:bg-[#2a2a2a]/50
    active:translate-y-1
  `,
  danger: `
    bg-gradient-to-b from-[#ffdad6] to-[#ffb4ab]
    text-[#690005] font-bold
    border-t border-[#ffdad6]/30
    border-b border-[#93000a]
    shadow-[0_2px_4px_rgba(0,0,0,0.4)]
    hover:bg-gradient-to-b hover:from-[#ffb4ab] hover:to-[#ff8a80]
    active:bg-gradient-to-b active:from-[#ff8a80] active:to-[#93000a]
    active:translate-y-1
  `,
  outline: `
    bg-gradient-to-b from-[#2a2a2a] to-[#1b1b1c]
    text-[#e5e2e1] font-bold
    border border-[#4d4635]
    shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]
    hover:border-[#8e9192] hover:bg-[#353535]
    active:translate-y-1
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4.5 py-3 text-sm gap-2',
  lg: 'px-6 py-4 text-base gap-2.5 h-14',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        rounded-[var(--radius-button)]
        transition-all duration-200 ease-out
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
