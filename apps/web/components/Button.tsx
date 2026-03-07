"use client";
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors';
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary text-white hover:bg-primary-dark';
      break;
    case 'secondary':
      variantStyles = 'bg-secondary text-white hover:bg-secondary-dark';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 text-white hover:bg-red-700';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
      break;
    default:
      break;
  }
  return (
    <button className={`${base} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
