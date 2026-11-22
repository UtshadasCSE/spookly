import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface SpooklyButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const SpooklyButton: React.FC<SpooklyButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight uppercase transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-sm gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-sm gap-2',
    lg: 'px-7 py-3.5 text-sm sm:text-base rounded-sm gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#c8ff29] text-[#171717] border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] hover:shadow-[3px_3px_0px_0px_#171717] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#171717]',
    secondary:
      'bg-white text-[#171717] border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] hover:bg-[#f8f9f5] hover:shadow-[3px_3px_0px_0px_#171717] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#171717]',
    outline:
      'bg-transparent text-[#171717] border border-[#171717] hover:bg-neutral-100/60',
    ghost:
      'bg-transparent text-neutral-600 hover:text-[#171717] hover:bg-neutral-100/60',
    danger:
      'bg-rose-500 text-white border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] hover:bg-rose-600',
    dark:
      'bg-[#171717] text-white border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] hover:bg-neutral-800 hover:shadow-[3px_3px_0px_0px_#171717] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#171717]',
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
