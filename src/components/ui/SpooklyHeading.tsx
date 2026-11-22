import React from 'react';

interface SpooklyHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
}

export const SpooklyHeading: React.FC<SpooklyHeadingProps> = ({
  children,
  as: Component = 'h2',
  size = 'lg',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-base sm:text-lg font-bold tracking-tight',
    md: 'text-xl sm:text-2xl font-black tracking-tight',
    lg: 'text-2xl sm:text-4xl font-black tracking-tighter uppercase',
    xl: 'text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95]',
    hero: 'text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]',
  }[size];

  return (
    <Component className={`${sizeStyles} text-[#171717] ${className}`}>
      {children}
    </Component>
  );
};
