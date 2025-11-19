# Implementation Plan

## Phase-by-Phase Development Guide

---

## Phase 1: Project Setup & Infrastructure (Week 1, Days 1-2)

### 1.1 Initialize Project

```bash
# Create Vite project with React + TypeScript
pnpm create vite puzzle-game --template react-ts
cd puzzle-game

# Install core dependencies
pnpm install

# Install state management
pnpm add zustand

# Install drag-and-drop
pnpm add @dnd-kit/core @dnd-kit/utilities

# Install canvas library
pnpm add react-konva konva

# Install image upload
pnpm add react-dropzone

# Install celebration
pnpm add react-canvas-confetti

# Install routing
pnpm add react-router-dom

# Install styling
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p

# Install dev dependencies
pnpm add -D @types/react @types/react-dom
pnpm add -D eslint prettier eslint-config-prettier
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D husky lint-staged
```

### 1.2 Configure Tailwind CSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        puzzle: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
```

### 1.3 Project Structure

```
puzzle-game/
├── public/
│   └── sounds/              # Sound effects (snap, completion)
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── index.ts
│   │   ├── Upload/
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   └── index.ts
│   │   ├── Settings/
│   │   │   ├── DifficultySelector.tsx
│   │   │   ├── CustomSlider.tsx
│   │   │   ├── ShuffleToggle.tsx
│   │   │   └── index.ts
│   │   ├── Game/
│   │   │   ├── PuzzleBoard.tsx
│   │   │   ├── PuzzlePiece.tsx
│   │   │   ├── PieceTray.tsx
│   │   │   ├── GameHeader.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── index.ts
│   │   ├── Completion/
│   │   │   ├── CompletionOverlay.tsx
│   │   │   ├── ConfettiAnimation.tsx
│   │   │   └── index.ts
│   │   ├── shared/
│   │   │   ├── Button.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useResponsive.ts
│   │   ├── useCanvasSize.ts
│   │   ├── useSnapToGrid.ts
│   │   ├── usePuzzleCompletion.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── puzzleGenerator.ts
│   │   ├── imageProcessor.ts
│   │   └── soundManager.ts
│   ├── store/
│   │   ├── puzzleStore.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── puzzle.ts
│   │   ├── game.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── views/
│   │   ├── UploadView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── GameView.tsx
│   │   └── index.ts
│   ├── workers/
│   │   └── imageProcessor.worker.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .eslintrc.json
├── .prettierrc
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 1.4 Type Definitions

```typescript
// src/types/puzzle.ts
export interface Position {
  x: number;
  y: number;
}

export interface PieceShape {
  top: 'flat' | 'tab' | 'blank';
  right: 'flat' | 'tab' | 'blank';
  bottom: 'flat' | 'tab' | 'blank';
  left: 'flat' | 'tab' | 'blank';
}

export interface PuzzlePiece {
  id: string;
  row: number;
  col: number;
  correctPosition: Position;
  currentPosition: Position;
  shape: PieceShape;
  imageData: string;
  width: number;
  height: number;
  isPlaced: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export interface PuzzleConfig {
  difficulty: Difficulty;
  pieceCount: number;
  shuffled: boolean;
}

export interface PuzzleState {
  originalImage: File | null;
  imageUrl: string | null;
  config: PuzzleConfig;
  pieces: PuzzlePiece[];
  placedPieces: Set<string>;
  startTime: number | null;
  endTime: number | null;
  isCompleted: boolean;
}
```

---

## Phase 2: Image Upload & Processing (Week 1, Days 3-5)

### 2.1 Create Upload View

```typescript
// src/views/UploadView.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../components/Upload';
import { usePuzzleStore } from '../store/puzzleStore';

export function UploadView() {
  const navigate = useNavigate();
  const image = usePuzzleStore(state => state.originalImage);

  const handleUploadComplete = () => {
    navigate('/settings');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
        Puzzle Game
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Upload an image to create your custom jigsaw puzzle
      </p>
      <ImageUploader onUploadComplete={handleUploadComplete} />
    </div>
  );
}
```

### 2.2 Implement Image Uploader Component

**Features to implement**:
- Drag-and-drop zone
- File validation (type, size)
- Image preview
- Mobile camera access
- Error handling

**Testing checklist**:
- [ ] Upload PNG image
- [ ] Upload JPG image
- [ ] Upload WebP image
- [ ] Reject non-image files
- [ ] Reject files > 10MB
- [ ] Drag and drop works
- [ ] Click to upload works
- [ ] Mobile camera access works
- [ ] Preview displays correctly
- [ ] Error messages display

### 2.3 Image Processing Service

```typescript
// src/services/imageProcessor.ts
export class ImageProcessor {
  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be less than 10MB' };
    }

    return { valid: true };
  }

  /**
   * Load image and get dimensions
   */
  static async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image if too large
   */
  static async resizeImage(
    image: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    let { width, height } = image;

    // Calculate new dimensions maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  /**
   * Get optimal image size for device
   */
  static getOptimalSize(): { width: number; height: number } {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    if (isMobile) {
      return { width: 800, height: 600 };
    } else if (isTablet) {
      return { width: 1200, height: 900 };
    } else {
      return { width: 1600, height: 1200 };
    }
  }
}
```

---

## Phase 3: Puzzle Generation (Week 2, Days 1-5)

### 3.1 Settings View

```typescript
// src/views/SettingsView.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzleStore } from '../store/puzzleStore';
import { DifficultySelector, CustomSlider, ShuffleToggle } from '../components/Settings';
import { PuzzleGenerator } from '../services/puzzleGenerator';

export function SettingsView() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const { originalImage, config, setConfig, setPieces } = usePuzzleStore();

  const handleStartPuzzle = async () => {
    if (!originalImage) return;

    setIsGenerating(true);

    try {
      const generator = new PuzzleGenerator();
      const pieces = await generator.generatePuzzle(originalImage, config);
      setPieces(pieces);
      navigate('/game');
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
      toast.error('Failed to generate puzzle');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-8">Puzzle Settings</h2>

      <DifficultySelector
        selected={config.difficulty}
        onChange={(difficulty) => setConfig({ ...config, difficulty })}
      />

      {config.difficulty === 'custom' && (
        <CustomSlider
          value={config.pieceCount}
          onChange={(pieceCount) => setConfig({ ...config, pieceCount })}
          min={6}
          max={300}
        />
      )}

      <ShuffleToggle
        enabled={config.shuffled}
        onChange={(shuffled) => setConfig({ ...config, shuffled })}
      />

      <button
        onClick={handleStartPuzzle}
        disabled={isGenerating}
        className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Start Puzzle'}
      </button>
    </div>
  );
}
```

### 3.2 Puzzle Generator Algorithm

**Key algorithms to implement**:

1. **Grid Calculation**: Determine rows/cols from piece count
2. **Jigsaw Shape Generation**: Create realistic tab and blank curves
3. **Piece Extraction**: Cut image into shaped pieces
4. **Shuffling**: Randomize piece positions

**Implementation steps**:
1. Calculate grid dimensions
2. For each piece position:
   - Determine edge types (flat for borders, tab/blank for internal)
   - Generate bezier curves for tabs/blanks
   - Create clipping path
   - Extract image portion
   - Save as individual piece
3. Shuffle pieces if enabled

### 3.3 Bezier Curve Math for Jigsaw Pieces

```typescript
// src/utils/jigsawMath.ts
export interface BezierCurve {
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  x: number;
  y: number;
}

export class JigsawMath {
  /**
   * Generate tab curve (protrusion)
   */
  static generateTabCurve(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    tabSize: number,
    direction: 'horizontal' | 'vertical'
  ): BezierCurve[] {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    if (direction === 'horizontal') {
      // Horizontal tab (top or bottom edge)
      const controlOffset = tabSize;

      return [
        // First curve (left side of tab)
        {
          cp1x: startX + (midX - startX) * 0.3,
          cp1y: startY,
          cp2x: midX - tabSize / 2,
          cp2y: startY - controlOffset,
          x: midX,
          y: startY - tabSize
        },
        // Second curve (right side of tab)
        {
          cp1x: midX + tabSize / 2,
          cp1y: startY - controlOffset,
          cp2x: midX + (endX - midX) * 0.7,
          cp2y: startY,
          x: endX,
          y: endY
        }
      ];
    } else {
      // Vertical tab (left or right edge)
      const controlOffset = tabSize;

      return [
        // Similar calculations for vertical direction
        {
          cp1x: startX,
          cp1y: startY + (midY - startY) * 0.3,
          cp2x: startX - controlOffset,
          cp2y: midY - tabSize / 2,
          x: startX - tabSize,
          y: midY
        },
        {
          cp1x: startX - controlOffset,
          cp1y: midY + tabSize / 2,
          cp2x: startX,
          cp2y: midY + (endY - midY) * 0.7,
          x: endX,
          y: endY
        }
      ];
    }
  }

  /**
   * Generate blank curve (indentation) - inverse of tab
   */
  static generateBlankCurve(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    blankSize: number,
    direction: 'horizontal' | 'vertical'
  ): BezierCurve[] {
    // Same as tab but with inverted offset direction
    // Implementation mirrors generateTabCurve with sign flipped
    const curves = this.generateTabCurve(
      startX, startY, endX, endY, blankSize, direction
    );

    // Invert the curves
    return curves.map(curve => ({
      ...curve,
      // Flip control points to create indentation
      cp1y: direction === 'horizontal' ?
        startY + (startY - curve.cp1y) : curve.cp1y,
      cp2y: direction === 'horizontal' ?
        startY + (startY - curve.cp2y) : curve.cp2y,
      y: direction === 'horizontal' ?
        startY + (startY - curve.y) : curve.y
    }));
  }
}
```

### 3.4 Testing Puzzle Generation

**Test cases**:
- [ ] Easy (12 pieces) generates correctly
- [ ] Medium (48 pieces) generates correctly
- [ ] Hard (120 pieces) generates correctly
- [ ] Custom piece counts work (6-300)
- [ ] Tabs and blanks align correctly
- [ ] No gaps between pieces when assembled
- [ ] Shuffle randomizes positions
- [ ] Image quality preserved
- [ ] Performance acceptable (< 3s generation)

---

## Phase 4: Drag-and-Drop Gameplay (Week 3-4)

### 4.1 Game View Setup

```typescript
// src/views/GameView.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzleStore } from '../store/puzzleStore';
import { PuzzleBoard, GameHeader, CompletionOverlay } from '../components/Game';
import { usePuzzleCompletion } from '../hooks/usePuzzleCompletion';

export function GameView() {
  const navigate = useNavigate();
  const pieces = usePuzzleStore(state => state.pieces);
  const isCompleted = usePuzzleStore(state => state.isCompleted);

  usePuzzleCompletion(); // Auto-check completion

  useEffect(() => {
    if (pieces.length === 0) {
      navigate('/');
    }
  }, [pieces, navigate]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      <GameHeader />
      <PuzzleBoard />
      {isCompleted && <CompletionOverlay />}
    </div>
  );
}
```

### 4.2 Implement Drag-and-Drop

```typescript
// src/components/Game/PuzzlePiece.tsx
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface PuzzlePieceProps {
  piece: PuzzlePiece;
  onDragEnd: (id: string, position: Position) => void;
}

export function PuzzlePiece({ piece, onDragEnd }: PuzzlePieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
    data: piece
  });

  const [image] = useImage(piece.imageData);

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : piece.isPlaced ? 1 : 10
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute cursor-move ${isDragging ? 'opacity-70' : ''}`}
    >
      <canvas
        ref={(canvas) => {
          if (canvas && image) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Draw piece with jigsaw shape clipping
              drawJigsawPiece(ctx, image, piece.shape);
            }
          }
        }}
        width={piece.width}
        height={piece.height}
      />
    </div>
  );
}
```

### 4.3 Snap-to-Grid Logic

```typescript
// src/hooks/useSnapToGrid.ts
import { useCallback } from 'react';
import { usePuzzleStore } from '../store/puzzleStore';

const SNAP_THRESHOLD = 20; // pixels

export function useSnapToGrid() {
  const updatePiecePosition = usePuzzleStore(state => state.updatePiecePosition);

  const checkSnap = useCallback((
    piece: PuzzlePiece,
    newPosition: Position
  ): { shouldSnap: boolean; snapPosition?: Position } => {
    const distance = Math.sqrt(
      Math.pow(newPosition.x - piece.correctPosition.x, 2) +
      Math.pow(newPosition.y - piece.correctPosition.y, 2)
    );

    if (distance < SNAP_THRESHOLD) {
      return {
        shouldSnap: true,
        snapPosition: piece.correctPosition
      };
    }

    return { shouldSnap: false };
  }, []);

  const handleDrop = useCallback((pieceId: string, position: Position) => {
    const piece = usePuzzleStore.getState().pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const { shouldSnap, snapPosition } = checkSnap(piece, position);

    if (shouldSnap && snapPosition) {
      updatePiecePosition(pieceId, snapPosition, true);
      playSnapSound();
      showSnapFeedback(pieceId);
    } else {
      updatePiecePosition(pieceId, position, false);
    }
  }, [checkSnap, updatePiecePosition]);

  return { handleDrop, checkSnap };
}
```

### 4.4 Touch Events Configuration

```typescript
// src/components/Game/PuzzleBoard.tsx
import { DndContext, PointerSensor, TouchSensor, MouseSensor, useSensors, useSensor } from '@dnd-kit/core';

export function PuzzleBoard() {
  // Configure sensors for multi-input support
  const sensors = useSensors(
    // Pointer sensor (unified for mouse/touch/pen)
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum movement before drag starts
      },
    }),
    // Touch sensor with delay to prevent accidental drags
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold before drag
        tolerance: 5, // Allow 5px movement during hold
      },
    }),
    // Mouse sensor for desktop
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Puzzle pieces */}
    </DndContext>
  );
}
```

### 4.5 Visual Feedback

```typescript
// src/hooks/useVisualFeedback.ts
export function useVisualFeedback() {
  const showSnapFeedback = (pieceId: string) => {
    // Green glow animation
    const element = document.querySelector(`[data-piece-id="${pieceId}"]`);
    if (element) {
      element.classList.add('snap-animation');
      setTimeout(() => {
        element.classList.remove('snap-animation');
      }, 500);
    }
  };

  const showHoverFeedback = (isNearCorrect: boolean) => {
    // Visual hint when near correct position
    return isNearCorrect ? 'ring-2 ring-green-400 ring-opacity-50' : '';
  };

  return { showSnapFeedback, showHoverFeedback };
}

// CSS for snap animation
// src/index.css
@keyframes snap {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { box-shadow: 0 0 20px 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.snap-animation {
  animation: snap 0.5s ease-out;
}
```

---

## Phase 5: Polish & Enhancement (Week 4-5)

### 5.1 Completion Detection

```typescript
// src/hooks/usePuzzleCompletion.ts
import { useEffect } from 'react';
import { usePuzzleStore } from '../store/puzzleStore';

export function usePuzzleCompletion() {
  const { pieces, isCompleted, checkCompletion } = usePuzzleStore();

  useEffect(() => {
    const allPlaced = pieces.every(piece => piece.isPlaced);

    if (allPlaced && pieces.length > 0 && !isCompleted) {
      checkCompletion();
      triggerCelebration();
    }
  }, [pieces, isCompleted, checkCompletion]);
}

function triggerCelebration() {
  // Play completion sound
  playCompletionSound();

  // Trigger confetti
  fireConfetti();

  // Haptic feedback on mobile
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}
```

### 5.2 Celebration Animation

```typescript
// src/components/Completion/ConfettiAnimation.tsx
import { useCallback, useRef, useEffect } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

export function ConfettiAnimation({ active }: { active: boolean }) {
  const refAnimationInstance = useRef<any>(null);

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current?.({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio),
    });
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [makeShot]);

  useEffect(() => {
    if (active) {
      fire();
    }
  }, [active, fire]);

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 9999
      }}
    />
  );
}
```

### 5.3 Sound Effects

```typescript
// src/services/soundManager.ts
export class SoundManager {
  private static sounds: Map<string, HTMLAudioElement> = new Map();

  static preload() {
    const soundFiles = {
      snap: '/sounds/snap.mp3',
      completion: '/sounds/completion.mp3',
      pickup: '/sounds/pickup.mp3'
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });
  }

  static play(soundName: string, volume: number = 0.5) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(err => console.warn('Sound play failed:', err));
    }
  }
}

// Initialize in App.tsx
useEffect(() => {
  SoundManager.preload();
}, []);
```

### 5.4 Progress Bar

```typescript
// src/components/Game/ProgressBar.tsx
import { usePuzzleStore } from '../../store/puzzleStore';

export function ProgressBar() {
  const pieces = usePuzzleStore(state => state.pieces);
  const placedCount = pieces.filter(p => p.isPlaced).length;
  const totalCount = pieces.length;
  const percentage = (placedCount / totalCount) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      >
        <span className="sr-only">{placedCount} of {totalCount} pieces placed</span>
      </div>
      <div className="text-sm text-center mt-2">
        {placedCount} / {totalCount} pieces ({Math.round(percentage)}%)
      </div>
    </div>
  );
}
```

### 5.5 Responsive Optimizations

**Mobile-specific features**:
- Larger touch targets (minimum 44x44px)
- Piece preview panel for small screens
- Pinch-to-zoom for detailed placement
- Vibration feedback
- Optimized piece count for screen size

**Tablet optimizations**:
- Two-column layout (pieces tray + board)
- Medium piece count recommendations
- Support for both orientations

**Desktop enhancements**:
- Keyboard shortcuts
- Larger board area
- Preview thumbnail
- Multiple pieces selection (future)

---

## Phase 6: Testing & Deployment (Week 5-6)

### 6.1 Testing Strategy

**Unit Tests**:
```typescript
// src/services/__tests__/puzzleGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { PuzzleGenerator } from '../puzzleGenerator';

describe('PuzzleGenerator', () => {
  it('should generate correct number of pieces', async () => {
    const generator = new PuzzleGenerator();
    const mockImage = createMockImage();
    const config = { difficulty: 'easy', pieceCount: 12, shuffled: false };

    const pieces = await generator.generatePuzzle(mockImage, config);

    expect(pieces).toHaveLength(12);
  });

  it('should shuffle pieces when shuffled is true', async () => {
    // Test implementation
  });
});
```

**Integration Tests**:
```typescript
// src/views/__tests__/GameView.test.tsx
import { render, screen } from '@testing-library/react';
import { GameView } from '../GameView';

describe('GameView', () => {
  it('should display puzzle pieces', () => {
    render(<GameView />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

**E2E Tests** (Playwright):
```typescript
// e2e/puzzle-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete puzzle flow', async ({ page }) => {
  await page.goto('/');

  // Upload image
  await page.setInputFiles('input[type="file"]', './test-images/sample.jpg');

  // Select difficulty
  await page.click('text=Medium');

  // Start puzzle
  await page.click('text=Start Puzzle');

  // Verify pieces loaded
  await expect(page.locator('[data-testid="puzzle-piece"]')).toHaveCount(48);
});
```

### 6.2 Performance Optimization

**Checklist**:
- [ ] Code splitting by route
- [ ] Lazy load heavy components
- [ ] Memoize expensive calculations
- [ ] Use Web Workers for image processing
- [ ] Optimize canvas rendering
- [ ] Compress images
- [ ] Enable production build optimizations

```typescript
// src/App.tsx - Code splitting
import { lazy, Suspense } from 'react';

const UploadView = lazy(() => import('./views/UploadView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const GameView = lazy(() => import('./views/GameView'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<UploadView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/game" element={<GameView />} />
      </Routes>
    </Suspense>
  );
}
```

### 6.3 Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'canvas': ['react-konva', 'konva'],
          'dnd': ['@dnd-kit/core', '@dnd-kit/utilities'],
        },
      },
    },
  },
});
```

### 6.4 Deployment

**Vercel Deployment**:
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Netlify Deployment**:
```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Development Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1** | 2 days | Project setup, structure, types |
| **Phase 2** | 3 days | Image upload, validation, processing |
| **Phase 3** | 5 days | Puzzle generation, jigsaw algorithm |
| **Phase 4** | 7 days | Drag-and-drop, snap logic, touch support |
| **Phase 5** | 5 days | Completion, celebration, polish |
| **Phase 6** | 6 days | Testing, optimization, deployment |
| **Total** | 28 days | Complete puzzle game |

---

## Success Criteria

- [ ] Upload any image < 10MB
- [ ] Choose easy/medium/hard difficulty
- [ ] Customize piece count (6-300)
- [ ] Drag pieces with mouse/touch
- [ ] Pieces snap when correctly placed
- [ ] Progress bar updates in real-time
- [ ] Confetti celebration on completion
- [ ] Responsive on mobile/tablet/desktop
- [ ] 60fps performance during dragging
- [ ] < 3s page load time
- [ ] All tests passing
- [ ] Deployed and accessible

This implementation plan provides a clear roadmap from initial setup to production deployment!
