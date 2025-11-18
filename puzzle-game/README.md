# 🧩 React Puzzle Game

A modern, responsive puzzle game built with React, TypeScript, and Vite. Upload any image and turn it into a customizable jigsaw puzzle!

## ✨ Features

- **Image Upload**: Drag & drop or click to upload (supports JPG, PNG, WebP)
- **Multiple Difficulty Levels**: Easy (12 pieces), Medium (48 pieces), Hard (120 pieces), or Custom (6-300 pieces)
- **Realistic Jigsaw Pieces**: Algorithmically generated tab and blank shapes
- **Drag & Drop**: Smooth mouse and touch-based piece placement
- **Snap-to-Grid**: Pieces automatically snap when placed correctly
- **Progress Tracking**: Real-time progress bar and piece counter
- **Celebration Animation**: Confetti animation on puzzle completion
- **Fully Responsive**: Optimized for mobile, tablet, and desktop
- **Touch Support**: Native touch gestures with @dnd-kit
- **Client-Side Only**: All processing happens in your browser
- **Privacy First**: Images never leave your device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
pnpm build

# Preview production build
pnpm preview
```

## 🎮 How to Play

1. **Upload Image**: Click or drag an image onto the upload zone
2. **Configure**: Choose difficulty level and settings
3. **Play**: Drag puzzle pieces to their correct positions
4. **Complete**: Pieces snap when correctly placed - finish to see celebration!

## 🛠 Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Canvas**: React Konva
- **File Upload**: react-dropzone
- **Animation**: react-canvas-confetti

## 📁 Project Structure

```
src/
├── components/      # React components
│   ├── Completion/  # Completion overlay & confetti
│   ├── Game/        # Puzzle board & pieces
│   ├── Settings/    # Difficulty & settings components
│   ├── Upload/      # Image uploader
│   └── shared/      # Reusable UI components
├── hooks/           # Custom React hooks
├── services/        # Business logic
│   ├── imageProcessor.ts
│   ├── puzzleGenerator.ts
│   └── soundManager.ts
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Helper functions & constants
├── views/           # Page-level components
└── App.tsx          # Main app component
```

## 🎯 Key Features Implementation

### Puzzle Generation Algorithm

- Generates realistic jigsaw piece shapes with tabs and blanks
- Uses Bezier curves for smooth, natural-looking edges
- Ensures matching tab/blank pairs between adjacent pieces
- Supports custom piece counts from 6 to 300

### Responsive Design

- **Mobile**: Optimized for small screens with touch gestures
- **Tablet**: Two-column layout with side panels
- **Desktop**: Full-featured experience with keyboard support

### Performance Optimizations

- Image resizing based on device capabilities
- Efficient canvas rendering
- Memoized calculations
- Lazy loading and code splitting ready

## 🔧 Configuration

### Difficulty Presets

```typescript
DIFFICULTY_PRESETS = {
  easy: 12,    // 3x4 grid
  medium: 48,  // 6x8 grid
  hard: 120,   // 10x12 grid
  custom: configurable (6-300)
}
```

### Constraints

- Max image size: 10MB
- Accepted formats: JPG, PNG, WebP
- Piece count range: 6-300
- Snap threshold: 20 pixels

## 🧪 Development

```bash
# Run dev server
pnpm dev

# Type checking
pnpm exec tsc --noEmit

# Linting
pnpm lint

# Format code
pnpm exec prettier --write src/
```

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions welcome! This puzzle game was built following the comprehensive planning documentation in the parent directory.

## 🎉 Credits

Built with ❤️ using modern web technologies and best practices from 2025.
