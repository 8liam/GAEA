// File: app/components/FuturisticButton.tsx
import React, { ButtonHTMLAttributes } from 'react';

type FuturisticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Button label text */
  label: string;
  /** Optional custom className for further styling */
  className?: string;
};

export default function FuturisticButton({
  label,
  disabled = false,
  onClick,
  className = '',
  ...rest
}: FuturisticButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        px-6 py-3
        font-semibold tracking-wide
        rounded-xl
        bg-gradient-to-r from-indigo-500 to-purple-500
        text-white
        shadow-[0_0_10px_rgba(0,0,0,0.3)]
        hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]
        transition-all duration-200
        transform
        hover:scale-105
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-indigo-300
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `}
      aria-label={label}
      {...rest}
    >
      <span className="relative z-10">
        {label}
      </span>
      {/* Glassy overlay */}
      <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-[4px] pointer-events-none" />
    </button>
  );
}