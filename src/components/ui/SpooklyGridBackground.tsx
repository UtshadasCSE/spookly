import React from 'react';

interface SpooklyGridBackgroundProps {
  children: React.ReactNode;
  dense?: boolean;
  className?: string;
}

export const SpooklyGridBackground: React.FC<SpooklyGridBackgroundProps> = ({
  children,
  dense = false,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen w-full ${
        dense ? 'spookly-grid-dense' : 'spookly-grid'
      } text-[#171717] ${className}`}
    >
      {children}
    </div>
  );
};
