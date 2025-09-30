import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={clsx('bg-neutral-800 border border-neutral-700 rounded-xl shadow-soft p-6', className)} {...props}>
      {children}
    </div>
  );
};
