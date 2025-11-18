import { useEffect, useState } from 'react';
import { useResponsive } from './useResponsive';
import type { CanvasSize } from '../types';

export function useCanvasSize(): CanvasSize {
  const breakpoint = useResponsive();
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });

  useEffect(() => {
    const calculateSize = () => {
      const padding = {
        mobile: 16,
        tablet: 32,
        desktop: 64,
      }[breakpoint];

      const availableWidth = window.innerWidth - padding * 2;
      const availableHeight = window.innerHeight - 200; // Header/controls space

      setSize({
        width: Math.min(availableWidth, 1200),
        height: Math.min(availableHeight, 800),
      });
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [breakpoint]);

  return size;
}
