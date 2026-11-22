import { useState, useEffect } from 'react';

export interface MobileDetectionResult {
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  isMobileUserAgent: boolean;
  isSmallScreen: boolean;
}

const MOBILE_BREAKPOINT = 1024; // Requires full desktop/laptop width >= 1024px

export function checkIsMobileDevice(): MobileDetectionResult {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      screenWidth: 1440,
      screenHeight: 900,
      isMobileUserAgent: false,
      isSmallScreen: false,
    };
  }

  const userAgent = navigator.userAgent || '';
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    userAgent
  );

  const screenWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const screenHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const isSmallScreen = screenWidth < MOBILE_BREAKPOINT;

  // Touch screen check with coarse pointer
  const isTouchDevice =
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  // Considered mobile if user agent is mobile, OR if screen width is under desktop breakpoint (< 1024px)
  const isMobile = isMobileUserAgent || isSmallScreen || (isTouchDevice && screenWidth < 1200);

  return {
    isMobile,
    screenWidth,
    screenHeight,
    isMobileUserAgent,
    isSmallScreen,
  };
}

export function useIsMobileDevice(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>(() => checkIsMobileDevice());

  useEffect(() => {
    const handleUpdate = () => {
      setDetection(checkIsMobileDevice());
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });

    // Initial check after mount in case of SSR or layout shift
    handleUpdate();

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
    };
  }, []);

  return detection;
}
