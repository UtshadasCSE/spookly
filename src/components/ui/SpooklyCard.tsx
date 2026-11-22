import React from 'react';

interface SpooklyCardProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  showHandles?: boolean;
  tag?: string;
}

export const SpooklyCard: React.FC<SpooklyCardProps> = ({
  children,
  selected = false,
  onClick,
  className = '',
  showHandles = false,
  tag,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`relative bg-white transition-all duration-150 rounded-sm ${
        selected
          ? 'border-2 border-[#171717] shadow-[3px_3px_0px_0px_#171717] bg-[#fdfef9]'
          : 'border border-[#d4d4d4] hover:border-[#171717] hover:shadow-[2px_2px_0px_0px_rgba(23,23,23,0.1)]'
      } ${isClickable ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {/* Figma Selection Handles when selected or requested */}
      {(selected || showHandles) && (
        <>
          <span className="figma-handle -top-[4px] -left-[4px]" />
          <span className="figma-handle -top-[4px] -right-[4px]" />
          <span className="figma-handle -bottom-[4px] -left-[4px]" />
          <span className="figma-handle -bottom-[4px] -right-[4px]" />
        </>
      )}

      {tag && (
        <span className="absolute -top-3 left-3 bg-[#171717] text-[#c8ff29] text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase z-20">
          {tag}
        </span>
      )}

      {children}
    </div>
  );
};
