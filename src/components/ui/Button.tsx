import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'light';
  children: React.ReactNode;
}

export const Button = ({ className, variant = 'primary', children, ...props }: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200';
  const primaryStyles = 'bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 text-white hover:scale-105 hover:brightness-110 active:scale-100';
  const ghostStyles = 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700';
  const lightStyles = 'bg-white text-black hover:scale-105 hover:brightness-90 active:scale-100';

  return (
    <button
      className={clsx(
        baseStyles,
        {
          [primaryStyles]: variant === 'primary',
          [ghostStyles]: variant === 'ghost',
          [lightStyles]: variant === 'light',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
