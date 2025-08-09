// File: app/components/FuturisticEmailInput.tsx
import React, { InputHTMLAttributes } from 'react';

type FuturisticEmailInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Input label text */
  label?: string;
  /** Optional error message */
  errorMessage?: string;
};

export default function FuturisticEmailInput({
  label,
  errorMessage,
  id,
  name,
  value,
  onChange,
  placeholder = 'Enter your email',
  required,
  disabled,
  className = '',
  ...rest
}: FuturisticEmailInputProps) {
  const inputId = id ?? name ?? 'email-input';
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm text-gray-200 font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="email"
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full
            py-3
            px-4
            rounded-xl
            bg-gray-900/50
            border-2 border-transparent
            text-white
            placeholder:text-gray-400/70
            focus:outline-none
            focus:ring-2 focus:ring-indigo-400/50
            focus:border-indigo-400
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          {...rest}
        />
        <div
          className="
            absolute inset-0
            rounded-xl
            border-2
            border-indigo-400/30
            backdrop-blur-[4px]
            pointer-events-none
          "
        />
      </div>
      {errorMessage && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-red-400 font-medium"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}