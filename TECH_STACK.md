# Technology Stack - Detailed Analysis

## Frontend Framework

### Selected: **Vite + React 18+ with TypeScript**

#### Vite Benefits for Puzzle Games
```
Development Performance:
- Project start time: 390ms (vs 4.5s with Create React App)
- Build time: ~16.1s (vs 28.4s with CRA)
- Instant HMR with esbuild
- Pre-bundling with esbuild (10-100x faster than JavaScript-based bundlers)

Production Optimization:
- Automatic code splitting
- Tree shaking
- CSS code splitting
- Optimized asset loading
```

#### Why Vite Over Next.js?
| Criteria | Vite | Next.js |
|----------|------|---------|
| **Project Type** | Perfect for SPAs | Better for SSR/SEO |
| **Dev Startup** | 390ms | ~2-4s |
| **Build Speed** | Faster (esbuild) | Slower (webpack/turbopack) |
| **HMR** | Instant | Fast but slower |
| **Complexity** | Simple, focused | More features, more complex |
| **Bundle Size** | Minimal | Larger framework overhead |
| **Puzzle Game Fit** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Decision**: Puzzle games don't need SEO, SSR, or server components. Vite's speed and simplicity make it ideal.

#### TypeScript Configuration
```typescript
// Strict mode for type safety
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

---

## State Management

### Selected: **Zustand**

#### Why Zustand?

**Comparison Matrix (2025)**:
| Feature | Zustand | Redux Toolkit | Jotai | Context API |
|---------|---------|---------------|-------|-------------|
| **Bundle Size** | ~1KB | ~11KB | ~3KB | 0KB (built-in) |
| **Boilerplate** | Minimal | Moderate | Minimal | Low |
| **Learning Curve** | Easy | Moderate | Easy-Moderate | Easy |
| **Performance** | Excellent | Good | Excellent | Poor (re-renders) |
| **DevTools** | ✅ | ✅ | ✅ | ❌ |
| **Async Support** | ✅ | ✅ | ✅ | Manual |
| **Middleware** | ✅ | ✅ | ✅ | ❌ |
| **Puzzle Game Fit** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

#### Zustand Store Example
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PuzzleState {
  image: File | null;
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  pieceCount: number;
  isShuffled: boolean;
  pieces: PuzzlePiece[];
  completedPieces: Set<string>;

  setImage: (image: File) => void;
  setDifficulty: (difficulty: string) => void;
  updatePiecePosition: (id: string, position: Position) => void;
  markPieceComplete: (id: string) => void;
  resetPuzzle: () => void;
}

export const usePuzzleStore = create<PuzzleState>()(
  devtools(
    persist(
      (set) => ({
        image: null,
        difficulty: 'medium',
        pieceCount: 48,
        isShuffled: true,
        pieces: [],
        completedPieces: new Set(),

        setImage: (image) => set({ image }),
        setDifficulty: (difficulty) => set({ difficulty }),
        updatePiecePosition: (id, position) =>
          set((state) => ({
            pieces: state.pieces.map(p =>
              p.id === id ? { ...p, position } : p
            )
          })),
        markPieceComplete: (id) =>
          set((state) => ({
            completedPieces: new Set([...state.completedPieces, id])
          })),
        resetPuzzle: () => set({
          pieces: [],
          completedPieces: new Set()
        })
      }),
      { name: 'puzzle-storage' }
    )
  )
);
```

**Key Advantages**:
- No providers needed (unlike Context/Redux)
- Automatic re-render optimization
- Simple API
- Built-in persistence middleware
- Redux DevTools integration

---

## Drag-and-Drop System

### Selected: **@dnd-kit**

#### Detailed Comparison

**@dnd-kit vs react-dnd (2025)**:

| Feature | @dnd-kit | react-dnd |
|---------|----------|-----------|
| **Touch Support** | ✅ Built-in | ❌ Requires workarounds |
| **Bundle Size** | 10KB core | ~23KB |
| **Accessibility** | ✅ Keyboard navigation | Limited |
| **Performance** | Excellent | Good |
| **Mobile Experience** | Native feel | Poor without additional backend |
| **Dependencies** | Zero | Multiple |
| **API Design** | Modern hooks | Higher-order components |
| **Maintenance** | Active (2025) | Less active |

**Critical Finding**: react-dnd documentation explicitly states:
> "Unfortunately, it won't work on touch devices. The experience of dragging won't be great on touch devices."

Since mobile/tablet support is a **core requirement**, @dnd-kit is the clear choice.

#### @dnd-kit Implementation Example
```typescript
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function PuzzlePiece({ piece }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: piece.id,
    data: piece
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {/* Piece rendering */}
    </div>
  );
}

function PuzzleBoard() {
  const { setNodeRef } = useDroppable({ id: 'puzzle-board' });

  return (
    <div ref={setNodeRef}>
      {/* Drop zone */}
    </div>
  );
}
```

#### Touch-Specific Configuration
```typescript
import { PointerSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Prevent accidental drags
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  }),
  useSensor(MouseSensor)
);
```

---

## Canvas Rendering

### Selected: **React Konva (Konva.js React wrapper)**

#### Konva vs Fabric.js Analysis

| Criteria | Konva.js | Fabric.js |
|----------|----------|-----------|
| **Architecture** | Scene graph (game engine) | Object-oriented |
| **Performance** | Excellent for animations | Good for static content |
| **React Integration** | ✅ react-konva (official) | Third-party wrappers |
| **Bundle Size** | Smaller | Larger |
| **Learning Curve** | Moderate | Moderate-Hard |
| **Event Handling** | Built-in, optimized | Built-in |
| **Use Case Fit** | Games, real-time graphics | Image editors, static designs |
| **Puzzle Game Fit** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Differentiator**: Konva uses "dirty region detection" - only repaints changed canvas areas, critical for puzzle piece dragging performance.

#### React Konva Implementation
```typescript
import { Stage, Layer, Image, Group } from 'react-konva';
import useImage from 'use-image';

function PuzzlePieceCanvas({ piece, x, y, isDragging }) {
  const [image] = useImage(piece.imageUrl);

  return (
    <Group
      x={x}
      y={y}
      draggable
      opacity={isDragging ? 0.5 : 1}
      onDragEnd={(e) => {
        handleDragEnd(e.target.x(), e.target.y());
      }}
    >
      <Image
        image={image}
        clipFunc={(ctx) => {
          // Custom jigsaw piece shape clipping
          drawJigsawPath(ctx, piece.shape);
        }}
      />
    </Group>
  );
}

function PuzzleCanvas() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {pieces.map(piece => (
          <PuzzlePieceCanvas key={piece.id} {...piece} />
        ))}
      </Layer>
    </Stage>
  );
}
```

**Performance Features**:
- Layer caching for static elements
- Pixel-perfect hit detection
- GPU-accelerated transforms
- Automatic event delegation

---

## Image Upload

### Selected: **react-dropzone**

#### Feature Set
```typescript
import { useDropzone } from 'react-dropzone';

function ImageUploader() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10485760, // 10MB
    maxFiles: 1,
    onDrop: acceptedFiles => {
      handleImageUpload(acceptedFiles[0]);
    }
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ?
        <p>Drop the image here...</p> :
        <p>Drag & drop an image, or click to select</p>
      }
    </div>
  );
}
```

**Mobile Features**:
- Automatic camera access on mobile devices
- Touch-friendly interface
- File system access
- Responsive drag-and-drop area

---

## Celebration Animation

### Selected: **react-canvas-confetti**

#### Why This Library?
- Canvas-based (performant)
- Customizable presets
- Manual control via Conductor API
- Small bundle size
- Smooth 60fps animations

#### Implementation Example
```typescript
import { useCallback, useRef } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

function PuzzleCompletion() {
  const refAnimationInstance = useRef(null);

  const getInstance = useCallback((instance) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio, opts) => {
    refAnimationInstance.current?.({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio)
    });
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, { spread: 26, startVelocity: 55 });
    makeShot(0.2, { spread: 60 });
    makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    makeShot(0.1, { spread: 120, startVelocity: 45 });
  }, [makeShot]);

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
      }}
    />
  );
}
```

**Preset Options**:
- Fireworks
- Snow
- Realistic confetti physics
- Custom shapes (including emojis)

---

## Styling Solution

### Selected: **Tailwind CSS**

#### Why Tailwind for This Project?

| Aspect | Benefit |
|--------|---------|
| **Responsive Design** | Built-in breakpoint system (sm, md, lg, xl, 2xl) |
| **Performance** | Purges unused CSS in production |
| **Development Speed** | No context switching between files |
| **Consistency** | Design system built-in |
| **Mobile-First** | Default approach matches our requirement |
| **Dark Mode** | Easy toggle support (future feature) |

#### Responsive Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    }
  }
}
```

#### Usage Example
```tsx
<div className="
  w-full h-screen
  flex flex-col
  p-4 sm:p-6 md:p-8
  bg-gradient-to-br from-blue-50 to-purple-50
  md:flex-row
  gap-4 md:gap-6 lg:gap-8
">
  {/* Responsive layout */}
</div>
```

---

## Development Tools

### Build Tool: **Vite**
- Lightning-fast HMR
- Optimized production builds
- Built-in TypeScript support
- Plugin ecosystem

### Package Manager: **pnpm**
- Faster than npm/yarn
- Efficient disk space usage
- Strict dependency resolution

### Linting: **ESLint + Prettier**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```

### Testing: **Vitest + React Testing Library**
- Native Vite integration
- Fast test execution
- Component testing support
- Compatible with Jest APIs

---

## Backend Architecture (Minimal)

### Approach: **Serverless-First**

Since authentication is not required initially, the backend needs are minimal:

#### Option 1: Pure Client-Side (Recommended for MVP)
- All image processing in browser
- No backend required
- Use `localStorage` for puzzle state persistence
- File handling via browser File API

**Pros**:
- Zero backend costs
- Instant deployment
- Offline-capable
- Maximum performance

**Cons**:
- Image size limits (localStorage ~5-10MB)
- No cross-device sync
- No analytics without third-party service

#### Option 2: Serverless Functions (Future)
For future features (sharing, leaderboards):

**Platform**: Vercel or Netlify
```typescript
// api/upload-image.ts (Vercel Serverless Function)
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  const blob = await put('puzzle-images/filename.jpg', req.body, {
    access: 'public',
  });

  res.json({ url: blob.url });
}
```

**Storage**: Vercel Blob or Cloudinary
- Vercel Blob: $0.15/GB storage, $0.30/GB bandwidth
- Cloudinary: Free tier (25GB/month)

#### Option 3: Supabase (If persistence needed)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Upload image
const { data, error } = await supabase.storage
  .from('puzzle-images')
  .upload('user-id/puzzle.jpg', file);

// Save puzzle state
await supabase
  .from('puzzles')
  .insert({
    user_id: userId,
    image_url: imageUrl,
    pieces_count: 48,
    completed_pieces: []
  });
```

**Recommendation**: Start with Option 1 (pure client-side), migrate to Option 2 or 3 when user features are added.

---

## Summary: Complete Stack

```
┌─────────────────────────────────────────┐
│          Vite + React + TypeScript      │
├─────────────────────────────────────────┤
│ State:        Zustand                   │
│ Drag & Drop:  @dnd-kit                  │
│ Canvas:       React Konva               │
│ Upload:       react-dropzone            │
│ Styling:      Tailwind CSS              │
│ Celebration:  react-canvas-confetti     │
│ Forms:        React Hook Form           │
│ Testing:      Vitest + RTL              │
├─────────────────────────────────────────┤
│ Build:        Vite                      │
│ Package Mgr:  pnpm                      │
│ Linting:      ESLint + Prettier         │
│ Git Hooks:    Husky + lint-staged       │
├─────────────────────────────────────────┤
│ Hosting:      Vercel / Netlify          │
│ Backend:      Client-side (MVP)         │
│ Storage:      localStorage (MVP)        │
└─────────────────────────────────────────┘
```

This stack is optimized for:
- ⚡ Performance (Vite, Konva, Zustand)
- 📱 Mobile support (@dnd-kit, pointer events)
- 🎨 Developer experience (TypeScript, Tailwind)
- 📦 Small bundle size (all libraries < 100KB total)
- 🚀 Fast iteration (Vite HMR, minimal boilerplate)
