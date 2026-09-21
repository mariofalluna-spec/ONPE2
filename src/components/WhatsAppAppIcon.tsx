import React from 'react';

interface WhatsAppAppIconProps {
  size?: number;
  className?: string;
}

/**
 * Official WhatsApp App Icon matching the user's attachment:
 * Vibrant rounded squircle gradient with white speech bubble and phone handset silhouette.
 */
export const WhatsAppAppIcon: React.FC<WhatsAppAppIconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 select-none ${className}`}
  >
    <defs>
      <linearGradient id="wa_icon_grad" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3CE675" />
        <stop offset="100%" stopColor="#15B74F" />
      </linearGradient>
      <filter id="wa_shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
    
    {/* Rounded Squircle Body */}
    <rect width="48" height="48" rx="12" fill="url(#wa_icon_grad)" />
    
    {/* White Speech Bubble */}
    <path
      d="M24 9C15.7 9 9 15.7 9 24C9 26.8 9.8 29.4 11.2 31.6L9.5 38.5L16.7 36.9C18.9 38.2 21.4 39 24 39C32.3 39 39 32.3 39 24C39 15.7 32.3 9 24 9Z"
      stroke="white"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* White Phone Handset */}
    <path
      d="M20.2 16.2C19.8 15.2 19.3 15.2 18.8 15.2C18.4 15.2 17.9 15.2 17.4 15.7C16.9 16.2 15.7 17.3 15.7 19.5C15.7 21.7 17.3 24.5 17.5 24.8C17.8 25.1 20.5 29.3 24.7 31C28.2 32.4 29.2 32.1 30.3 31.9C31.6 31.6 33.2 30.3 33.6 29.1C34 27.9 34 26.9 33.8 26.7C33.6 26.5 33.1 26.3 32.4 26C31.7 25.7 29.5 24.6 29.1 24.4C28.7 24.2 28.4 24.1 28.1 24.6C27.8 25.1 27 26 26.7 26.4C26.4 26.7 26.1 26.8 25.6 26.5C25.1 26.2 23.5 25.7 21.6 24C20.1 22.7 19.1 21.1 18.8 20.6C18.5 20.1 18.8 19.8 19 19.6C19.2 19.4 19.5 19 19.8 18.7C20.1 18.4 20.2 18.2 20.4 17.8C20.6 17.4 20.5 17.1 20.4 16.8C20.3 16.5 20.4 16.7 20.2 16.2Z"
      fill="white"
    />
  </svg>
);
