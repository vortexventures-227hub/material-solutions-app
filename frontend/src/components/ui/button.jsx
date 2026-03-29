import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] min-h-[48px] px-6 py-3',
  {
    variants: {
      variant: {
        // Primary — Industrial Yellow
        brand:
          'bg-gradient-to-br from-vortex-yellow to-amber-400 text-vortex-black border-2 border-vortex-yellow-dark hover:from-vortex-yellow-light hover:to-vortex-yellow shadow-[0_4px_12px_rgba(253,224,71,0.4)] hover:shadow-[0_6px_20px_rgba(253,224,71,0.55)] hover:-translate-y-0.5 focus-visible:ring-vortex-yellow',

        // Secondary — Industrial Black with yellow border
        secondary:
          'bg-vortex-black text-vortex-yellow border-2 border-vortex-yellow hover:bg-vortex-dark hover:border-vortex-yellow-light hover:shadow-[0_0_16px_rgba(253,224,71,0.25)] hover:-translate-y-0.5 focus-visible:ring-vortex-yellow',

        // Danger — Red
        destructive:
          'bg-red-600 text-white border-2 border-red-700 hover:bg-red-500 hover:-translate-y-0.5 shadow-sm focus-visible:ring-red-500',

        // Ghost — transparent with yellow hover
        ghost:
          'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-vortex-gray hover:text-vortex-black dark:hover:text-vortex-yellow border-2 border-transparent hover:border-vortex-yellow/30',

        // Link
        link:
          'text-vortex-yellow underline-offset-4 hover:underline hover:text-vortex-yellow-light',

        // Outline — yellow border
        outline:
          'border-2 border-vortex-yellow/60 text-vortex-black dark:text-vortex-yellow bg-transparent hover:bg-vortex-yellow/5 hover:border-vortex-yellow hover:shadow-[0_0_12px_rgba(253,224,71,0.25)]',

        // Orange accent
        accent:
          'bg-gradient-to-br from-vortex-orange to-orange-600 text-white border-2 border-orange-700 hover:from-orange-400 hover:to-vortex-orange hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(249,115,22,0.4)] focus-visible:ring-vortex-orange',

        // Disabled/draft variant
        muted:
          'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed',
      },
      size: {
        default: 'h-12 px-6 py-3 text-sm',
        sm: 'h-10 px-4 py-2 text-xs rounded-lg min-h-[40px]',
        lg: 'h-14 px-8 py-4 text-lg rounded-xl min-h-[56px]',
        xl: 'h-16 px-10 py-5 text-xl rounded-xl min-h-[64px]',
        icon: 'h-12 w-12 min-h-[48px] min-w-[48px] p-0 rounded-xl',
        'icon-sm': 'h-10 w-10 min-h-[40px] min-w-[40px] p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'default',
    },
  }
);

export function Button({ className, variant, size, children, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
}

export default Button;
