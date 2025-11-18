# Self-Hosting Setup Guide

## Overview

This puzzle application is designed to be self-hosted on localhost with **zero backend dependencies**. Everything runs entirely in the browser, making it perfect for local development and personal use.

## Architecture for Self-Hosting

### Pure Client-Side Application

```
┌─────────────────────────────────────────┐
│         Your Browser (localhost)        │
├─────────────────────────────────────────┤
│  • Image processing (Canvas API)        │
│  • Puzzle generation (JavaScript)       │
│  • State management (Zustand)           │
│  • Storage (localStorage)               │
│  • All rendering (React + Konva)        │
└─────────────────────────────────────────┘
         ↑                    ↑
         │                    │
    User uploads        App saves state
    local images        to localStorage
```

**No external services required!**

---

## Quick Start

### Development Mode (Recommended)

```bash
# Navigate to project directory
cd puzzle-game

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to:
# http://localhost:5173
```

**Development server features**:
- Hot Module Replacement (instant updates)
- Source maps for debugging
- Fast refresh
- Full TypeScript support

---

### Production Build (Local Serving)

If you want optimized production performance on localhost:

#### Option 1: Build and Preview (Simplest)

```bash
# Build optimized production bundle
pnpm build

# Preview the production build
pnpm preview

# Open browser to:
# http://localhost:4173
```

#### Option 2: Build and Serve with Static Server

```bash
# Build production bundle
pnpm build

# Install a static file server
pnpm add -g serve

# Serve the dist folder
serve -s dist -p 3000

# Open browser to:
# http://localhost:3000
```

#### Option 3: Python Simple Server

```bash
# Build production bundle
pnpm build

# Navigate to dist folder
cd dist

# Start Python server (Python 3)
python -m http.server 8000

# Open browser to:
# http://localhost:8000
```

#### Option 4: Node.js HTTP Server

```bash
# Build production bundle
pnpm build

# Install http-server globally
npm install -g http-server

# Serve dist folder
http-server dist -p 8080

# Open browser to:
# http://localhost:8080
```

---

## Storage Configuration

### LocalStorage Setup

Since there's no backend, all data is stored in browser localStorage:

```typescript
// src/utils/storage.ts
export class LocalStorage {
  private static PREFIX = 'puzzle_';

  /**
   * Save puzzle state
   */
  static savePuzzle(id: string, data: SavedPuzzle): void {
    try {
      const key = `${this.PREFIX}${id}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save puzzle:', error);
      // Handle quota exceeded error
      this.cleanupOldPuzzles();
    }
  }

  /**
   * Load puzzle state
   */
  static loadPuzzle(id: string): SavedPuzzle | null {
    try {
      const key = `${this.PREFIX}${id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      return null;
    }
  }

  /**
   * List all saved puzzles
   */
  static listPuzzles(): SavedPuzzle[] {
    const puzzles: SavedPuzzle[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          puzzles.push(JSON.parse(data));
        }
      }
    }
    return puzzles;
  }

  /**
   * Delete puzzle
   */
  static deletePuzzle(id: string): void {
    const key = `${this.PREFIX}${id}`;
    localStorage.removeItem(key);
  }

  /**
   * Clean up old puzzles to free space
   */
  static cleanupOldPuzzles(keepCount: number = 10): void {
    const puzzles = this.listPuzzles()
      .sort((a, b) => b.lastPlayedTime - a.lastPlayedTime);

    // Keep only the most recent puzzles
    puzzles.slice(keepCount).forEach(puzzle => {
      this.deletePuzzle(puzzle.id);
    });
  }

  /**
   * Get storage usage
   */
  static getStorageInfo(): { used: number; available: number } {
    const totalSpace = 5 * 1024 * 1024; // Typically 5MB
    let usedSpace = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        usedSpace += key.length + (item?.length || 0);
      }
    }

    return {
      used: usedSpace,
      available: totalSpace - usedSpace
    };
  }
}
```

### Storage Limits

**LocalStorage constraints**:
- Typical limit: 5-10MB per origin
- Varies by browser
- Synchronous API (can block UI for large data)

**Recommendations for localhost**:
- Store max 10 saved puzzles
- Compress image data before storage
- Clean up old puzzles automatically
- Show storage usage in UI

---

## Image Handling (Client-Side Only)

### File Upload Without Backend

```typescript
// src/services/imageProcessor.ts
export class ImageProcessor {
  /**
   * Process uploaded image entirely in browser
   */
  static async processImage(file: File): Promise<ProcessedImage> {
    // Validate file
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Read file using FileReader (browser API)
    const dataUrl = await this.fileToDataURL(file);

    // Load image
    const img = await this.loadImage(dataUrl);

    // Resize if needed
    const optimized = await this.optimizeImage(img);

    return {
      dataUrl,
      width: optimized.width,
      height: optimized.height,
      size: file.size
    };
  }

  /**
   * Convert File to Data URL (no server needed)
   */
  private static fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Optimize image size for performance
   */
  private static async optimizeImage(
    img: HTMLImageElement
  ): Promise<{ width: number; height: number; dataUrl: string }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Max dimensions for localhost (adjust based on your needs)
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;

    let { width, height } = img;

    // Resize if too large
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    return {
      width,
      height,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9)
    };
  }
}
```

---

## Configuration for Localhost

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Server configuration for localhost
  server: {
    port: 5173,           // Development port
    host: 'localhost',    // Bind to localhost only
    strictPort: true,     // Fail if port is already in use
    open: true,           // Auto-open browser
  },

  // Preview configuration (production build preview)
  preview: {
    port: 4173,
    host: 'localhost',
    strictPort: true,
    open: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,     // Disable for production
    minify: 'terser',

    // Optimize for localhost (can be more aggressive)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'canvas': ['react-konva', 'konva'],
          'dnd': ['@dnd-kit/core', '@dnd-kit/utilities'],
          'utils': ['zustand', 'react-dropzone', 'react-canvas-confetti']
        }
      }
    }
  }
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "serve": "vite preview --port 3000",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest"
  }
}
```

---

## Browser Compatibility for Localhost

### Required Browser Features

All modern browsers on localhost support:
- ✅ FileReader API (image upload)
- ✅ Canvas API (puzzle rendering)
- ✅ localStorage (save state)
- ✅ Pointer Events (unified input)
- ✅ ES2020+ JavaScript
- ✅ CSS Grid & Flexbox

### Testing on Localhost

```bash
# Test in Chrome
google-chrome http://localhost:5173

# Test in Firefox
firefox http://localhost:5173

# Test in Safari (macOS)
open -a Safari http://localhost:5173

# Test in Edge
msedge http://localhost:5173
```

---

## Performance Optimization for Localhost

### Recommended Settings

```typescript
// src/config/localhost.ts
export const LOCALHOST_CONFIG = {
  // Increase piece count limits (your machine can handle it)
  maxPieces: {
    mobile: 100,
    tablet: 200,
    desktop: 500  // Higher than cloud deployment
  },

  // Disable analytics (no tracking needed)
  analytics: false,

  // Enable debug mode
  debug: true,

  // Longer localStorage retention
  maxSavedPuzzles: 50,  // More than cloud version

  // Higher quality images (no bandwidth concerns)
  imageQuality: 0.95,   // vs 0.8 for cloud

  // Enable all experimental features
  experimentalFeatures: true,

  // No rate limiting
  rateLimiting: false
};
```

---

## Development Workflow

### Hot Module Replacement

Vite's HMR works seamlessly on localhost:

```typescript
// Automatic state preservation during development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR update');
  });

  // Preserve state during HMR
  import.meta.hot.dispose(() => {
    const state = usePuzzleStore.getState();
    sessionStorage.setItem('hmr-state', JSON.stringify(state));
  });
}
```

### Developer Tools

```typescript
// Enable React DevTools
// Enable Redux DevTools for Zustand
import { devtools } from 'zustand/middleware';

export const usePuzzleStore = create(
  devtools((set, get) => ({
    // ... store implementation
  }))
);

// Enable verbose logging in development
if (import.meta.env.DEV) {
  console.log('Development mode enabled');
  window.__PUZZLE_STORE__ = usePuzzleStore;
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 5173
# Linux/Mac:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### localStorage Full

```typescript
// Clear old puzzles
LocalStorage.cleanupOldPuzzles(5);

// Or clear all puzzle data
localStorage.clear();
```

### Browser Cache Issues

```bash
# Force clear cache and restart
# Chrome: Ctrl+Shift+R (hard reload)
# Firefox: Ctrl+Shift+R
# Safari: Cmd+Shift+R
```

---

## Security Notes for Localhost

### No CORS Issues
- All resources served from same origin
- No cross-origin restrictions
- File upload works without CORS headers

### Content Security Policy
Not strictly necessary for localhost, but good practice:

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline';">
```

---

## Backup and Portability

### Export Your Puzzles

```typescript
// Export all saved puzzles to JSON file
export function exportPuzzles(): void {
  const puzzles = LocalStorage.listPuzzles();
  const data = JSON.stringify(puzzles, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `puzzle-backup-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Import puzzles from JSON file
export function importPuzzles(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const puzzles = JSON.parse(e.target?.result as string);
        puzzles.forEach((puzzle: SavedPuzzle) => {
          LocalStorage.savePuzzle(puzzle.id, puzzle);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}
```

---

## Summary: Self-Hosting Advantages

### ✅ Benefits of Localhost

1. **Zero Cost**: No hosting fees, no service limits
2. **Full Privacy**: Images never leave your machine
3. **Maximum Performance**: No network latency
4. **Unlimited Storage**: Only limited by your disk (via localStorage)
5. **No Quotas**: Use as much as you want
6. **Offline Capable**: Works without internet
7. **Easy Development**: Instant feedback with HMR
8. **Full Control**: Modify anything, no restrictions

### 🎯 Perfect For

- Personal use
- Development and testing
- Learning React/TypeScript
- Privacy-conscious users
- Offline environments
- Customization and experimentation

---

## Next Steps

1. **Start Development Server**:
   ```bash
   pnpm dev
   ```

2. **Open Browser**:
   Navigate to http://localhost:5173

3. **Start Building**:
   Follow the IMPLEMENTATION_PLAN.md

4. **No Deployment Needed**:
   Everything runs in your browser!

---

**That's it!** The entire application runs client-side on localhost with zero backend dependencies. Perfect for self-hosting! 🎉
