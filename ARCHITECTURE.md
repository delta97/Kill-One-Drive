# Application Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         User Interface                        │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Upload    │  │   Settings   │  │  Puzzle Board    │   │
│  │  Component  │─▶│  Component   │─▶│    Component     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│        │                 │                     │             │
└────────┼─────────────────┼─────────────────────┼─────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    State Management (Zustand)                 │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐            │
│  │   Image    │ │   Puzzle   │ │     Game     │            │
│  │   State    │ │  Settings  │ │    State     │            │
│  └────────────┘ └────────────┘ └──────────────┘            │
└──────────────────────────────────────────────────────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                     │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Image Processor│ │   Puzzle     │ │  Collision       │  │
│  │   (Canvas)     │ │  Generator   │ │   Detector       │  │
│  └────────────────┘ └──────────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     Rendering Layer                           │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │   React    │ │   @dnd-kit   │ │   React Konva        │  │
│  │  Konva     │ │  (Drag/Drop) │ │   (Canvas Render)    │  │
│  └────────────┘ └──────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   └── HelpButton
│   └── Main
│       ├── UploadView (Route: /)
│       │   ├── ImageUploader
│       │   │   ├── DropZone
│       │   │   └── ImagePreview
│       │   └── UploadInstructions
│       │
│       ├── SettingsView (Route: /settings)
│       │   ├── DifficultySelector
│       │   │   ├── PresetButtons (Easy/Medium/Hard)
│       │   │   └── CustomSlider
│       │   ├── ShuffleToggle
│       │   └── StartButton
│       │
│       └── GameView (Route: /game)
│           ├── GameHeader
│           │   ├── ProgressBar
│           │   ├── Timer (optional)
│           │   └── ResetButton
│           │
│           ├── PuzzleBoard
│           │   ├── PuzzleCanvas (Konva Stage)
│           │   │   ├── BackgroundLayer
│           │   │   │   └── GridGuide
│           │   │   └── PiecesLayer
│           │   │       └── PuzzlePiece (×N)
│           │   │           ├── PieceImage
│           │   │           └── PieceShape (clip path)
│           │   └── DndContext (from @dnd-kit)
│           │
│           ├── PieceTray
│           │   └── UnplacedPieces
│           │       └── PuzzlePiece (×N)
│           │
│           └── CompletionOverlay
│               ├── ConfettiCanvas
│               ├── CompletionMessage
│               └── ActionButtons
│                   ├── PlayAgainButton
│                   └── NewPuzzleButton
│
└── GlobalComponents
    ├── LoadingSpinner
    ├── ErrorBoundary
    └── Toast/Notifications
```

---

## Core Components Specification

### 1. App Component
**Responsibility**: Root component, routing, global providers

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import UploadView from './views/UploadView';
import SettingsView from './views/SettingsView';
import GameView from './views/GameView';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<UploadView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/game" element={<GameView />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

### 2. ImageUploader Component
**Responsibility**: Handle file upload and validation

```typescript
// src/components/ImageUploader.tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePuzzleStore } from '../store/puzzleStore';

interface ImageUploaderProps {
  onUploadComplete: () => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const setImage = usePuzzleStore(state => state.setImage);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('Image must be less than 10MB');
      return;
    }

    setImage(file);
    onUploadComplete();
  }, [setImage, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10485760
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12
        transition-colors cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        hover:border-blue-400 hover:bg-gray-50
      `}
    >
      <input {...getInputProps()} />
      {/* Upload UI */}
    </div>
  );
}
```

**Features**:
- Drag-and-drop file upload
- File type validation
- File size validation
- Mobile camera access
- Image preview

---

### 3. PuzzleGenerator Service
**Responsibility**: Generate puzzle pieces from image

```typescript
// src/services/puzzleGenerator.ts
import { PuzzlePiece, PuzzleConfig } from '../types';

export class PuzzleGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Generate puzzle pieces from image
   */
  async generatePuzzle(
    imageFile: File,
    config: PuzzleConfig
  ): Promise<PuzzlePiece[]> {
    const image = await this.loadImage(imageFile);
    const { rows, cols } = this.calculateGrid(config);

    const pieceWidth = image.width / cols;
    const pieceHeight = image.height / rows;

    const pieces: PuzzlePiece[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const piece = this.generatePiece({
          image,
          row,
          col,
          rows,
          cols,
          pieceWidth,
          pieceHeight
        });
        pieces.push(piece);
      }
    }

    if (config.shuffled) {
      return this.shufflePieces(pieces);
    }

    return pieces;
  }

  /**
   * Generate individual puzzle piece with jigsaw shape
   */
  private generatePiece(params: PieceParams): PuzzlePiece {
    const { image, row, col, rows, cols, pieceWidth, pieceHeight } = params;

    // Determine tabs/blanks for each edge
    const shape = {
      top: row === 0 ? 'flat' : this.randomTabOrBlank(),
      right: col === cols - 1 ? 'flat' : this.randomTabOrBlank(),
      bottom: row === rows - 1 ? 'flat' : this.randomTabOrBlank(),
      left: col === 0 ? 'flat' : this.randomTabOrBlank()
    };

    // Create piece canvas
    const pieceCanvas = this.createPieceCanvas(
      image,
      row * pieceHeight,
      col * pieceWidth,
      pieceWidth,
      pieceHeight,
      shape
    );

    return {
      id: `piece-${row}-${col}`,
      row,
      col,
      correctPosition: { x: col * pieceWidth, y: row * pieceHeight },
      currentPosition: { x: 0, y: 0 }, // Will be set by shuffle
      shape,
      imageData: pieceCanvas.toDataURL(),
      width: pieceWidth,
      height: pieceHeight,
      isPlaced: false
    };
  }

  /**
   * Create canvas with jigsaw piece shape
   */
  private createPieceCanvas(
    image: HTMLImageElement,
    sourceY: number,
    sourceX: number,
    width: number,
    height: number,
    shape: PieceShape
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Add padding for tabs
    const padding = width * 0.2;
    canvas.width = width + padding * 2;
    canvas.height = height + padding * 2;

    ctx.save();
    ctx.translate(padding, padding);

    // Draw jigsaw path
    ctx.beginPath();
    this.drawJigsawPath(ctx, width, height, shape);
    ctx.closePath();
    ctx.clip();

    // Draw image portion
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      width,
      height,
      0,
      0,
      width,
      height
    );

    ctx.restore();

    return canvas;
  }

  /**
   * Draw jigsaw puzzle piece path with tabs and blanks
   */
  private drawJigsawPath(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    shape: PieceShape
  ) {
    const tabSize = width * 0.2;

    // Top edge
    ctx.moveTo(0, 0);
    if (shape.top === 'tab') {
      this.drawTab(ctx, width / 2, 0, tabSize, 'up');
    } else if (shape.top === 'blank') {
      this.drawBlank(ctx, width / 2, 0, tabSize, 'up');
    }
    ctx.lineTo(width, 0);

    // Right edge
    if (shape.right === 'tab') {
      this.drawTab(ctx, width, height / 2, tabSize, 'right');
    } else if (shape.right === 'blank') {
      this.drawBlank(ctx, width, height / 2, tabSize, 'right');
    }
    ctx.lineTo(width, height);

    // Bottom edge
    if (shape.bottom === 'tab') {
      this.drawTab(ctx, width / 2, height, tabSize, 'down');
    } else if (shape.bottom === 'blank') {
      this.drawBlank(ctx, width / 2, height, tabSize, 'down');
    }
    ctx.lineTo(0, height);

    // Left edge
    if (shape.left === 'tab') {
      this.drawTab(ctx, 0, height / 2, tabSize, 'left');
    } else if (shape.left === 'blank') {
      this.drawBlank(ctx, 0, height / 2, tabSize, 'left');
    }
    ctx.lineTo(0, 0);
  }

  /**
   * Draw tab protrusion using bezier curves
   */
  private drawTab(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    // Implementation of smooth bezier curve for tab
    // This creates the classic jigsaw "knob"
    const angle = { up: -90, down: 90, left: 180, right: 0 }[direction];
    const rad = (angle * Math.PI) / 180;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rad);

    // Draw curved tab
    ctx.bezierCurveTo(
      0, 0,
      -size / 2, -size,
      0, -size
    );
    ctx.bezierCurveTo(
      size / 2, -size,
      size, 0,
      size, 0
    );

    ctx.restore();
  }

  /**
   * Draw blank indentation
   */
  private drawBlank(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    // Similar to drawTab but inverted
    // Creates the indentation that receives a tab
  }

  private randomTabOrBlank(): 'tab' | 'blank' {
    return Math.random() > 0.5 ? 'tab' : 'blank';
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private calculateGrid(config: PuzzleConfig) {
    const pieceCount = config.pieceCount;
    // Calculate rows and cols based on piece count
    // Maintain approximately 4:3 aspect ratio
    const cols = Math.ceil(Math.sqrt(pieceCount * (4 / 3)));
    const rows = Math.ceil(pieceCount / cols);
    return { rows, cols };
  }

  private shufflePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
    // Fisher-Yates shuffle
    const shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
```

---

### 4. PuzzleBoard Component
**Responsibility**: Main game canvas with drag-and-drop

```typescript
// src/components/PuzzleBoard.tsx
import { Stage, Layer } from 'react-konva';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { usePuzzleStore } from '../store/puzzleStore';
import { PuzzlePieceComponent } from './PuzzlePiece';
import { useSnapToGrid } from '../hooks/useSnapToGrid';

export function PuzzleBoard() {
  const pieces = usePuzzleStore(state => state.pieces);
  const updatePiecePosition = usePuzzleStore(state => state.updatePiecePosition);
  const { snapToGrid, isNearCorrectPosition } = useSnapToGrid();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const piece = pieces.find(p => p.id === active.id);

    if (!piece) return;

    const newPosition = {
      x: piece.currentPosition.x + delta.x,
      y: piece.currentPosition.y + delta.y
    };

    // Check if near correct position (snap tolerance)
    if (isNearCorrectPosition(piece, newPosition)) {
      // Snap to correct position
      updatePiecePosition(piece.id, piece.correctPosition, true);
      playSnapSound();
    } else {
      // Update to dragged position
      updatePiecePosition(piece.id, newPosition, false);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        className="puzzle-canvas"
      >
        <Layer>
          {pieces.map(piece => (
            <PuzzlePieceComponent
              key={piece.id}
              piece={piece}
            />
          ))}
        </Layer>
      </Stage>
    </DndContext>
  );
}
```

---

### 5. Collision Detection & Snap Logic

```typescript
// src/hooks/useSnapToGrid.ts
import { useMemo } from 'react';
import { PuzzlePiece, Position } from '../types';

export function useSnapToGrid() {
  const SNAP_THRESHOLD = 20; // pixels

  const isNearCorrectPosition = (
    piece: PuzzlePiece,
    position: Position
  ): boolean => {
    const distance = Math.sqrt(
      Math.pow(position.x - piece.correctPosition.x, 2) +
      Math.pow(position.y - piece.correctPosition.y, 2)
    );

    return distance < SNAP_THRESHOLD;
  };

  const snapToGrid = (position: Position, gridSize: number): Position => {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  };

  return {
    isNearCorrectPosition,
    snapToGrid,
    SNAP_THRESHOLD
  };
}
```

---

## State Management Structure

### Zustand Store Architecture

```typescript
// src/store/puzzleStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PuzzleState {
  // Image state
  originalImage: File | null;
  imageUrl: string | null;

  // Puzzle configuration
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  pieceCount: number;
  isShuffled: boolean;

  // Game state
  pieces: PuzzlePiece[];
  placedPieces: Set<string>;
  startTime: number | null;
  endTime: number | null;
  isCompleted: boolean;

  // Actions
  setImage: (file: File) => void;
  setDifficulty: (difficulty: string) => void;
  setPieceCount: (count: number) => void;
  setShuffled: (shuffled: boolean) => void;
  setPieces: (pieces: PuzzlePiece[]) => void;
  updatePiecePosition: (id: string, position: Position, isPlaced: boolean) => void;
  checkCompletion: () => void;
  resetPuzzle: () => void;
  startNewGame: () => void;
}

export const usePuzzleStore = create<PuzzleState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        originalImage: null,
        imageUrl: null,
        difficulty: 'medium',
        pieceCount: 48,
        isShuffled: true,
        pieces: [],
        placedPieces: new Set(),
        startTime: null,
        endTime: null,
        isCompleted: false,

        // Actions
        setImage: (file) => {
          const url = URL.createObjectURL(file);
          set({ originalImage: file, imageUrl: url });
        },

        setDifficulty: (difficulty) => {
          const pieceCount = {
            easy: 12,
            medium: 48,
            hard: 120,
            custom: get().pieceCount
          }[difficulty] || 48;

          set({ difficulty, pieceCount });
        },

        setPieceCount: (count) => set({ pieceCount: count }),
        setShuffled: (shuffled) => set({ isShuffled: shuffled }),

        setPieces: (pieces) => set({
          pieces,
          startTime: Date.now(),
          isCompleted: false
        }),

        updatePiecePosition: (id, position, isPlaced) => set((state) => {
          const updatedPieces = state.pieces.map(piece =>
            piece.id === id
              ? { ...piece, currentPosition: position, isPlaced }
              : piece
          );

          const newPlacedPieces = new Set(state.placedPieces);
          if (isPlaced) {
            newPlacedPieces.add(id);
          }

          return {
            pieces: updatedPieces,
            placedPieces: newPlacedPieces
          };
        }),

        checkCompletion: () => set((state) => {
          const isCompleted = state.pieces.every(piece => piece.isPlaced);
          if (isCompleted && !state.isCompleted) {
            return {
              isCompleted: true,
              endTime: Date.now()
            };
          }
          return state;
        }),

        resetPuzzle: () => set({
          pieces: [],
          placedPieces: new Set(),
          startTime: null,
          endTime: null,
          isCompleted: false
        }),

        startNewGame: () => set({
          originalImage: null,
          imageUrl: null,
          pieces: [],
          placedPieces: new Set(),
          startTime: null,
          endTime: null,
          isCompleted: false
        })
      }),
      {
        name: 'puzzle-storage',
        partialize: (state) => ({
          difficulty: state.difficulty,
          pieceCount: state.pieceCount,
          isShuffled: state.isShuffled
        })
      }
    )
  )
);
```

---

## Responsive Design Architecture

### Breakpoint Strategy

```typescript
// src/hooks/useResponsive.ts
import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useResponsive(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
```

### Responsive Canvas Sizing

```typescript
// src/hooks/useCanvasSize.ts
import { useEffect, useState } from 'react';
import { useResponsive } from './useResponsive';

export function useCanvasSize() {
  const breakpoint = useResponsive();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const calculateSize = () => {
      const padding = {
        mobile: 16,
        tablet: 32,
        desktop: 64
      }[breakpoint];

      const availableWidth = window.innerWidth - padding * 2;
      const availableHeight = window.innerHeight - 200; // Header/controls

      setSize({
        width: Math.min(availableWidth, 1200),
        height: Math.min(availableHeight, 800)
      });
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [breakpoint]);

  return size;
}
```

---

## Performance Optimizations

### 1. Canvas Layer Management
```typescript
// Separate static and dynamic layers
<Stage>
  <Layer name="background"> {/* Cached, rarely updates */}
    <GridGuide />
  </Layer>
  <Layer name="placed-pieces"> {/* Cached when pieces placed */}
    {placedPieces.map(piece => <PuzzlePiece />)}
  </Layer>
  <Layer name="dragging-pieces"> {/* Active, updates frequently */}
    {draggingPieces.map(piece => <PuzzlePiece />)}
  </Layer>
</Stage>
```

### 2. Memoization
```typescript
// Memoize expensive calculations
const pieceShapes = useMemo(() =>
  generatePieceShapes(config),
  [config.rows, config.cols]
);

// Memoize components
const PuzzlePiece = memo(({ piece }) => {
  // Component implementation
}, (prev, next) => {
  return prev.piece.id === next.piece.id &&
         prev.piece.currentPosition.x === next.piece.currentPosition.x &&
         prev.piece.currentPosition.y === next.piece.currentPosition.y;
});
```

### 3. Web Workers for Image Processing
```typescript
// src/workers/imageProcessor.worker.ts
self.addEventListener('message', async (e) => {
  const { imageData, config } = e.data;

  // Heavy processing in worker thread
  const pieces = await generatePuzzlePieces(imageData, config);

  self.postMessage({ pieces });
});
```

---

## Error Handling

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Puzzle Error:', error, errorInfo);
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Oops! Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload Puzzle
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Summary

This architecture provides:

- ✅ **Separation of Concerns**: Clear boundaries between UI, state, and logic
- ✅ **Scalability**: Easy to add new features (timer, hints, etc.)
- ✅ **Performance**: Optimized rendering and state updates
- ✅ **Maintainability**: Type-safe, well-structured code
- ✅ **Testability**: Isolated components and services
- ✅ **Responsiveness**: Adaptive to all screen sizes
- ✅ **Developer Experience**: Clear patterns and conventions
