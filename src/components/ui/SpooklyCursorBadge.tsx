import React from 'react';
import { motion } from 'framer-motion';

interface SpooklyCursorBadgeProps {
  name: string;
  color?: string; // e.g. '#c8ff29' or '#171717'
  textColor?: string;
  className?: string;
  delay?: number;
}

export const SpooklyCursorBadge: React.FC<SpooklyCursorBadgeProps> = ({
  name,
  color = '#c8ff29',
  textColor = '#171717',
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`inline-flex items-center gap-1.5 pointer-events-none select-none z-30 ${className}`}
    >
      {/* Figma multiplayer cursor SVG */}
      <svg
        width="16"
        height="18"
        viewBox="0 0 16 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
      >
        <path
          d="M1 1L6.5 16.5L9.5 10.5L15.5 8L1 1Z"
          fill={color}
          stroke="#171717"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Label tag */}
      <span
        style={{ backgroundColor: color, color: textColor }}
        className="text-[11px] font-bold font-mono px-2 py-0.5 border border-[#171717] shadow-[2px_2px_0px_0px_#171717] tracking-wider rounded-xs uppercase whitespace-nowrap"
      >
        {name}
      </span>
    </motion.div>
  );
};
