import React from 'react';
import { motion } from 'framer-motion';

interface SpooklySelectionBoxProps {
  children: React.ReactNode;
  tag?: string;
  className?: string;
  boxClassName?: string;
  showHandles?: boolean;
  animated?: boolean;
  active?: boolean;
}

export const SpooklySelectionBox: React.FC<SpooklySelectionBoxProps> = ({
  children,
  tag,
  className = '',
  boxClassName = '',
  showHandles = true,
  animated = true,
  active = true,
}) => {
  const content = (
    <span
      className={`relative inline-block border-2 border-[#171717] bg-[#c8ff29] px-2.5 py-1 text-[#171717] ${
        active ? 'shadow-[2px_2px_0px_0px_#171717]' : ''
      } ${boxClassName}`}
    >
      {/* Figma corner handles */}
      {showHandles && (
        <>
          <span className="figma-handle -top-[4.5px] -left-[4.5px]" />
          <span className="figma-handle -top-[4.5px] -right-[4.5px]" />
          <span className="figma-handle -bottom-[4.5px] -left-[4.5px]" />
          <span className="figma-handle -bottom-[4.5px] -right-[4.5px]" />
        </>
      )}

      {/* Optional Figma dimension/tag badge */}
      {tag && (
        <span className="absolute -top-6 left-0 bg-[#171717] text-[#c8ff29] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs tracking-wider uppercase z-20 pointer-events-none">
          {tag}
        </span>
      )}

      {children}
    </span>
  );

  if (animated) {
    return (
      <motion.span
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`inline-block ${className}`}
      >
        {content}
      </motion.span>
    );
  }

  return <span className={`inline-block ${className}`}>{content}</span>;
};
