// File: app/components/NeoButton.tsx
import { FC } from 'react';

type NeoButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
};

export const NeoButton: FC<NeoButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => {
  const base =
    'relative inline-flex items-center justify-center overflow-hidden rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses =
    variant === 'primary'
      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
      : 'bg-gradient-to-br from-gray-700 to-gray-900 text-gray-200 shadow-md hover:shadow-lg';
  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-sm'
      : size === 'lg'
        ? 'px-6 py-3 text-lg'
        : 'px-4 py-2 text-base';

  const glassOverlay = (
    <span
      aria-hidden="true"
      className="absolute inset-0 backdrop-blur-md bg-white/10 rounded-xl"
    />
  );

  const neonBorder = (
    <span
      aria-hidden="true"
      className="absolute inset-0 rounded-xl border-2 border-indigo-400/30 blur-[2px]"
    />
  );

  const ripple = (
    <span
      aria-hidden="true"
      className="absolute inset-0 transition-transform duration-300 transform scale-125 opacity-0 group-hover:scale-100 group-hover:opacity-100"
    />
  );

  return (
    <button
      type="button"
      className={`${base} ${variantClasses} ${sizeClasses} group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {glassOverlay}
      {neonBorder}
      {ripple}
      <span className="relative z-10">{label}</span>
    </button>
  );
};