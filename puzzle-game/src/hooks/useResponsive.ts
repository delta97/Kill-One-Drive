import { useEffect, useState } from 'react';
import type { Breakpoint } from '../types';
import { BREAKPOINTS } from '../utils';

export function useResponsive(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    const width = window.innerWidth;
    if (width < BREAKPOINTS.mobile) {
      return 'mobile';
    } else if (width < BREAKPOINTS.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
