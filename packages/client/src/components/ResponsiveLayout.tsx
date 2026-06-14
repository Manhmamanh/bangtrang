import { ReactNode } from 'react';
import { useIsMobile, useIsTouchDevice } from '../hooks/useMediaQuery';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export function MobileOnly({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  return isMobile ? <>{children}</> : null;
}

export function DesktopOnly({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  return !isMobile ? <>{children}</> : null;
}

export function TouchDeviceOnly({ children }: { children: ReactNode }) {
  const isTouchDevice = useIsTouchDevice();
  return isTouchDevice ? <>{children}</> : null;
}

export function MouseDeviceOnly({ children }: { children: ReactNode }) {
  const isTouchDevice = useIsTouchDevice();
  return !isTouchDevice ? <>{children}</> : null;
}

/**
 * Responsive container that adjusts layout based on screen size
 */
export function ResponsiveContainer({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`responsive-container ${className}`}>
      {children}
    </div>
  );
}

/**
 * Touch-friendly button wrapper for mobile
 */
export function TouchFriendlyButton({
  onClick,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const isTouchDevice = useIsTouchDevice();

  return (
    <button
      onClick={onClick}
      style={
        isTouchDevice
          ? {
              minHeight: '48px',
              minWidth: '48px',
              padding: '12px 16px',
            }
          : {}
      }
      {...props}
    >
      {children}
    </button>
  );
}
