import React from 'react';

interface WhatsAppAppIconProps {
  size?: number;
  className?: string;
}

/**
 * Clean, solid WhatsApp Vector Icon that fills seamlessly with currentColor or custom sizing,
 * matching lucide-react icons like Phone.
 */
export const WhatsAppAppIcon: React.FC<WhatsAppAppIconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 select-none ${className}`}
  >
    <path d="M12.001 2C6.48 2 2 6.48 2 12c0 1.84.5 3.56 1.37 5.05L2 22l5.12-1.34A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12.001 2zm5.78 14.37c-.24.68-1.2 1.3-1.76 1.38-.47.07-1.07.1-3.21-.78-2.58-1.06-4.23-3.7-4.36-3.87-.13-.17-1.04-1.38-1.04-2.64 0-1.25.65-1.87.88-2.12.23-.25.51-.31.68-.31.17 0 .34 0 .49.01.16.01.37-.06.58.44.22.52.75 1.83.82 1.96.07.14.11.3.02.48-.09.17-.14.28-.27.43-.14.15-.29.34-.41.46-.14.13-.28.28-.12.55.16.27.71 1.17 1.53 1.9 1.05.93 1.94 1.22 2.22 1.36.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.13.25.09 1.58.74 1.85.88.27.13.45.2.52.31.06.12.06.7-.18 1.38z" />
  </svg>
);
