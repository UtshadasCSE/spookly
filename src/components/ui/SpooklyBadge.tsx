import React from 'react';

interface SpooklyBadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'white' | 'charcoal' | 'outline';
  dot?: boolean;
  className?: string;
}

export const SpooklyBadge: React.FC<SpooklyBadgeProps> = ({
  children,
  variant = 'white',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    lime: 'bg-[#c8ff29] text-[#171717] border border-[#171717]',
    white: 'bg-white text-[#171717] border border-[#171717]',
    charcoal: 'bg-[#171717] text-[#c8ff29] border border-[#171717]',
    outline: 'bg-transparent text-neutral-700 border border-neutral-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full select-none ${variantStyles} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'charcoal' ? 'bg-[#c8ff29]' : 'bg-[#171717]'
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
