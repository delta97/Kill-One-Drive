import type { Difficulty } from '../types';

// Puzzle difficulty presets
export const DIFFICULTY_PRESETS: Record<Difficulty, number> = {
  easy: 12,    // 3x4 grid
  medium: 48,  // 6x8 grid
  hard: 120,   // 10x12 grid
  custom: 48,  // Default for custom
};

// Piece count constraints
export const MIN_PIECE_COUNT = 6;
export const MAX_PIECE_COUNT = 300;

// Snap threshold for puzzle piece placement (in pixels)
export const SNAP_THRESHOLD = 20;

// Image upload constraints
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// Optimal image sizes for different devices
export const OPTIMAL_IMAGE_SIZES = {
  mobile: { width: 800, height: 600 },
  tablet: { width: 1200, height: 900 },
  desktop: { width: 1600, height: 1200 },
} as const;

// Tab/blank size as percentage of piece size
export const TAB_SIZE_RATIO = 0.2;

// Confetti animation configuration
export const CONFETTI_CONFIG = {
  particleCount: 200,
  spread: 70,
  origin: { y: 0.7 },
} as const;
