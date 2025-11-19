# Responsive Design & Mobile Optimization

## Overview

This document details the strategies for creating a seamless experience across mobile, tablet, and desktop devices with particular emphasis on touch interactions and responsive layouts.

---

## Breakpoint Strategy

### Device Categories

```typescript
// src/utils/breakpoints.ts
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 640,   // Large phones
  md: 768,   // Tablets (portrait)
  lg: 1024,  // Tablets (landscape) / Small desktops
  xl: 1280,  // Desktops
  '2xl': 1536 // Large desktops
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}
```

### Responsive Hook

```typescript
// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';
import { getDeviceType, DeviceType } from '../utils/breakpoints';

interface ResponsiveState {
  deviceType: DeviceType;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => ({
    deviceType: getDeviceType(window.innerWidth),
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = getDeviceType(width);

      setState({
        deviceType,
        width,
        height,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}
```

---

## Layout Adaptations

### Mobile Layout (< 768px)

**Characteristics**:
- Single column layout
- Full-screen puzzle board
- Bottom sheet for piece tray
- Simplified controls
- Larger touch targets (min 44x44px)

```tsx
// src/views/GameView.mobile.tsx
export function MobileGameView() {
  const [showPieceTray, setShowPieceTray] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Compact */}
      <header className="h-14 flex items-center justify-between px-4 bg-white shadow-md">
        <button onClick={handleBack} className="p-2">
          <BackIcon className="w-6 h-6" />
        </button>
        <ProgressIndicator compact />
        <button onClick={handleReset} className="p-2">
          <ResetIcon className="w-6 h-6" />
        </button>
      </header>

      {/* Puzzle Board - Full screen */}
      <main className="flex-1 relative overflow-hidden">
        <PuzzleBoard />
      </main>

      {/* Floating piece tray button */}
      <button
        onClick={() => setShowPieceTray(true)}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-blue-500 shadow-lg flex items-center justify-center"
      >
        <PuzzleIcon className="w-6 h-6 text-white" />
      </button>

      {/* Bottom sheet piece tray */}
      <BottomSheet
        open={showPieceTray}
        onClose={() => setShowPieceTray(false)}
      >
        <PieceTray />
      </BottomSheet>
    </div>
  );
}
```

**Piece Count Recommendations**:
- Phone (portrait): Max 24 pieces (4x6)
- Phone (landscape): Max 35 pieces (5x7)

### Tablet Layout (768px - 1024px)

**Characteristics**:
- Two-column layout
- Side panel for pieces
- Larger board area
- Medium piece counts

```tsx
// src/views/GameView.tablet.tsx
export function TabletGameView() {
  const { orientation } = useResponsive();

  return (
    <div className={`flex h-screen ${
      orientation === 'portrait' ? 'flex-col' : 'flex-row'
    }`}>
      {/* Header */}
      <header className="h-16 px-6 bg-white shadow flex items-center justify-between">
        <Logo />
        <ProgressBar />
        <Controls />
      </header>

      <div className={`flex-1 flex ${
        orientation === 'portrait' ? 'flex-col' : 'flex-row'
      }`}>
        {/* Puzzle Board */}
        <main className="flex-1 p-4">
          <PuzzleBoard />
        </main>

        {/* Piece Tray - Side panel */}
        <aside className={`bg-gray-50 ${
          orientation === 'portrait' ? 'h-48' : 'w-80'
        } overflow-auto`}>
          <PieceTray />
        </aside>
      </div>
    </div>
  );
}
```

**Piece Count Recommendations**:
- Tablet (portrait): 48-80 pieces (6x8 to 8x10)
- Tablet (landscape): 80-120 pieces (8x10 to 10x12)

### Desktop Layout (>= 1024px)

**Characteristics**:
- Multi-panel layout
- Keyboard shortcuts
- Larger piece counts
- Advanced controls

```tsx
// src/views/GameView.desktop.tsx
export function DesktopGameView() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Controls */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <Logo />
        <Divider />
        <GameStats />
        <Divider />
        <Controls />
        <Divider />
        <HelpPanel />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white shadow px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Puzzle Game</h1>
          <ProgressBar />
          <Timer />
        </header>

        {/* Puzzle board */}
        <main className="flex-1 p-8 overflow-auto">
          <PuzzleBoard />
        </main>
      </div>

      {/* Right sidebar - Piece tray */}
      <aside className="w-80 bg-gray-50 overflow-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Puzzle Pieces</h2>
        <PieceTray />
      </aside>
    </div>
  );
}
```

**Piece Count Recommendations**:
- Desktop: 120-300 pieces (10x12 to 15x20)

---

## Touch Events & Gestures

### Unified Input Handling

```typescript
// src/hooks/useUnifiedInput.ts
import { useEffect, useCallback } from 'react';

interface InputHandlers {
  onDragStart: (x: number, y: number, id: string) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
}

export function useUnifiedInput(handlers: InputHandlers) {
  const isDragging = useRef(false);
  const draggedId = useRef<string | null>(null);

  // Mouse events
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const pieceId = target.dataset.pieceId;
    if (!pieceId) return;

    isDragging.current = true;
    draggedId.current = pieceId;
    handlers.onDragStart(e.clientX, e.clientY, pieceId);
  }, [handlers]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    handlers.onDragMove(e.clientX, e.clientY);
  }, [handlers]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    handlers.onDragEnd(e.clientX, e.clientY);
    isDragging.current = false;
    draggedId.current = null;
  }, [handlers]);

  // Touch events
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const target = e.target as HTMLElement;
    const pieceId = target.dataset.pieceId;
    if (!pieceId) return;

    const touch = e.touches[0];
    isDragging.current = true;
    draggedId.current = pieceId;
    handlers.onDragStart(touch.clientX, touch.clientY, pieceId);
  }, [handlers]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault(); // Prevent scrolling while dragging

    const touch = e.touches[0];
    handlers.onDragMove(touch.clientX, touch.clientY);
  }, [handlers]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;

    const touch = e.changedTouches[0];
    handlers.onDragEnd(touch.clientX, touch.clientY);
    isDragging.current = false;
    draggedId.current = null;
  }, [handlers]);

  // Pointer events (modern unified approach)
  const handlePointerDown = useCallback((e: PointerEvent) => {
    const target = e.target as HTMLElement;
    const pieceId = target.dataset.pieceId;
    if (!pieceId) return;

    target.setPointerCapture(e.pointerId);
    isDragging.current = true;
    draggedId.current = pieceId;
    handlers.onDragStart(e.clientX, e.clientY, pieceId);
  }, [handlers]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    handlers.onDragMove(e.clientX, e.clientY);
  }, [handlers]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;

    const target = e.target as HTMLElement;
    target.releasePointerCapture(e.pointerId);

    handlers.onDragEnd(e.clientX, e.clientY);
    isDragging.current = false;
    draggedId.current = null;
  }, [handlers]);

  return {
    // Use pointer events (modern, unified)
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,

    // Fallbacks for older browsers
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
```

### Touch-Specific Optimizations

```typescript
// src/utils/touchOptimizations.ts

/**
 * Prevent text selection during drag
 */
export function preventTextSelection() {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
}

export function restoreTextSelection() {
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
}

/**
 * Prevent pull-to-refresh on mobile
 */
export function preventPullToRefresh() {
  document.body.style.overscrollBehavior = 'none';
}

/**
 * Enable smooth scrolling momentum on iOS
 */
export function enableSmoothScrolling() {
  document.body.style.webkitOverflowScrolling = 'touch';
}

/**
 * Disable iOS callout menu on long press
 */
export function disableCallout() {
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
}
```

### Haptic Feedback

```typescript
// src/services/haptics.ts
export class HapticFeedback {
  /**
   * Light impact for piece pickup
   */
  static light() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  /**
   * Medium impact for piece snap
   */
  static medium() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  /**
   * Heavy impact for puzzle completion
   */
  static heavy() {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  }

  /**
   * Success pattern
   */
  static success() {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 100]);
    }
  }

  /**
   * Error pattern
   */
  static error() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  }
}

// Usage
onPiecePickup(() => HapticFeedback.light());
onPieceSnap(() => HapticFeedback.medium());
onPuzzleComplete(() => HapticFeedback.success());
```

---

## Performance Optimizations for Mobile

### 1. Canvas Rendering

```typescript
// src/utils/canvasOptimizations.ts

/**
 * Get optimal canvas resolution based on device
 */
export function getOptimalCanvasResolution(): number {
  // Lower resolution on older/slower devices
  const pixelRatio = window.devicePixelRatio || 1;
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Cap at 2x for mobile to preserve performance
    return Math.min(pixelRatio, 2);
  }

  return pixelRatio;
}

/**
 * Throttle canvas redraws during drag
 */
export function throttleRedraw(callback: () => void, limit: number = 16) {
  let waiting = false;

  return function() {
    if (!waiting) {
      callback();
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}
```

### 2. Image Loading Strategy

```typescript
// src/services/imageLoader.ts
export class ImageLoader {
  /**
   * Progressive image loading for mobile
   */
  static async loadProgressive(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<HTMLImageElement> {
    // Load low-res preview first
    const preview = await this.createThumbnail(file, 400);
    onProgress?.(50);

    // Then load full resolution
    const fullRes = await this.loadImage(file);
    onProgress?.(100);

    return fullRes;
  }

  /**
   * Create thumbnail for preview
   */
  static async createThumbnail(
    file: File,
    maxSize: number
  ): Promise<HTMLImageElement> {
    const image = await this.loadImage(file);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const scale = Math.min(maxSize / image.width, maxSize / image.height);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return this.canvasToImage(canvas);
  }

  /**
   * Lazy load pieces not in viewport
   */
  static useLazyPieceLoading(pieces: PuzzlePiece[]): PuzzlePiece[] {
    const [visiblePieces, setVisiblePieces] = useState<PuzzlePiece[]>([]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const pieceId = entry.target.getAttribute('data-piece-id');
              // Load piece image
            }
          });
        },
        { rootMargin: '50px' }
      );

      // Observe piece elements
      // ...

      return () => observer.disconnect();
    }, [pieces]);

    return visiblePieces;
  }
}
```

### 3. Memory Management

```typescript
// src/utils/memoryManagement.ts

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupObjectURLs(urls: string[]) {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * Monitor memory usage (if available)
 */
export function monitorMemory() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    });
  }
}

/**
 * Limit piece count based on available memory
 */
export function getRecommendedPieceCount(deviceType: DeviceType): number {
  const memory = (performance as any).memory;

  if (!memory) {
    // Conservative defaults
    return {
      mobile: 24,
      tablet: 48,
      desktop: 120
    }[deviceType];
  }

  const availableMB = memory.jsHeapSizeLimit / 1048576;

  if (deviceType === 'mobile') {
    return availableMB > 512 ? 35 : 24;
  } else if (deviceType === 'tablet') {
    return availableMB > 1024 ? 80 : 48;
  } else {
    return availableMB > 2048 ? 200 : 120;
  }
}
```

---

## Accessibility Considerations

### 1. Touch Target Sizing

```css
/* src/styles/accessibility.css */

/* Minimum touch target size: 44x44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Increase spacing between interactive elements */
.touch-target + .touch-target {
  margin-left: 12px;
}

/* Larger targets on mobile */
@media (max-width: 768px) {
  .touch-target {
    min-width: 48px;
    min-height: 48px;
    padding: 14px;
  }
}
```

### 2. Keyboard Navigation (Desktop)

```typescript
// src/hooks/useKeyboardNavigation.ts
export function useKeyboardNavigation() {
  const { pieces, selectedPieceId, selectPiece, movePiece } = usePuzzleStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPieceId) return;

      const moveDistance = e.shiftKey ? 10 : 1; // Fine/coarse movement

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          movePiece(selectedPieceId, { x: 0, y: -moveDistance });
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(selectedPieceId, { x: 0, y: moveDistance });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(selectedPieceId, { x: -moveDistance, y: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(selectedPieceId, { x: moveDistance, y: 0 });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          attemptSnap(selectedPieceId);
          break;
        case 'Escape':
          e.preventDefault();
          selectPiece(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPieceId, movePiece, selectPiece]);
}
```

### 3. Screen Reader Support

```tsx
// src/components/Game/PuzzlePiece.tsx
export function PuzzlePiece({ piece }: { piece: PuzzlePiece }) {
  const percentComplete = usePuzzleStore(state =>
    (state.placedPieces.size / state.pieces.length) * 100
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Puzzle piece ${piece.row + 1}, ${piece.col + 1}. ${
        piece.isPlaced ? 'Correctly placed' : 'Not placed'
      }`}
      aria-describedby="puzzle-instructions"
      data-piece-id={piece.id}
    >
      {/* Piece rendering */}
    </div>
  );
}

// Hidden instructions for screen readers
<div id="puzzle-instructions" className="sr-only">
  Use arrow keys to move selected piece. Press Enter to attempt placement.
  Press Escape to deselect. {percentComplete}% complete.
</div>
```

---

## Testing Across Devices

### Device Testing Matrix

| Device Category | Test Devices | Screen Sizes | Key Tests |
|----------------|--------------|--------------|-----------|
| **Mobile** | iPhone SE, iPhone 14, Pixel 7 | 320-428px | Touch drag, rotation, small pieces |
| **Tablet** | iPad, iPad Pro, Galaxy Tab | 768-1024px | Split layout, medium pieces |
| **Desktop** | Chrome, Firefox, Safari | 1280-1920px | Keyboard nav, large pieces |

### Responsive Testing Tools

```typescript
// src/utils/deviceEmulation.ts

/**
 * Simulate different device pixel ratios
 */
export function simulateDevicePixelRatio(ratio: number) {
  // For testing canvas rendering at different DPRs
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => ratio
  });
}

/**
 * Simulate touch events on desktop
 */
export function enableTouchSimulation() {
  // For testing touch interactions with mouse
  document.addEventListener('mousedown', (e) => {
    const touchEvent = new TouchEvent('touchstart', {
      touches: [createTouch(e)],
      changedTouches: [createTouch(e)],
      bubbles: true
    });
    e.target?.dispatchEvent(touchEvent);
  });
}

function createTouch(mouseEvent: MouseEvent): Touch {
  return {
    identifier: Date.now(),
    target: mouseEvent.target as EventTarget,
    clientX: mouseEvent.clientX,
    clientY: mouseEvent.clientY,
    pageX: mouseEvent.pageX,
    pageY: mouseEvent.pageY,
    screenX: mouseEvent.screenX,
    screenY: mouseEvent.screenY,
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 0,
    force: 0.5
  } as Touch;
}
```

---

## Summary

This responsive design approach ensures:

✅ **Mobile-First**: Optimized for touch devices
✅ **Progressive Enhancement**: Enhanced experience on larger screens
✅ **Unified Input**: Seamless mouse, touch, and keyboard support
✅ **Performance**: Optimized for mobile constraints
✅ **Accessibility**: WCAG 2.1 AA compliant
✅ **Device-Aware**: Adaptive piece counts and layouts

The puzzle game will work beautifully across all devices with appropriate optimizations for each platform.
