import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  hint,
  icon: Icon,
  className = '',
  id,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`;
  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="label-system text-[#8e9192]"
        >
          {label}
          {required && <span className="text-[#ffb4ab] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          disabled={disabled}
          className={`
            w-full
            bg-[#0e0e0e]
            border border-[#4d4635]
            rounded-[var(--radius-input)]
            ${Icon ? 'pl-11' : 'px-4'} py-3
            text-sm text-[#e5e2e1] font-semibold
            placeholder:text-[#8e9192]/70
            transition-all duration-200
            shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]
            focus:outline-none focus:border-[#eac249] focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05),0_0_0_2px_rgba(234,194,73,0.2)]
            ${error ? 'border-[#ffb4ab] focus:border-[#ffb4ab] focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05),0_0_0_2px_rgba(255,180,171,0.3)]' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isPassword ? 'pr-11' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e9192] hover:text-[#e5e2e1] transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#ffb4ab] flex items-center gap-1.5 font-medium mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[#8e9192] mt-0.5 leading-normal">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
