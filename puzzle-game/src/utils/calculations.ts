import type { Position, PuzzleConfig } from '../types';

/**
 * Calculate grid dimensions (rows and cols) from piece count
 * Maintains approximately 4:3 aspect ratio
 */
export function calculateGridDimensions(pieceCount: number): { rows: number; cols: number } {
  const cols = Math.ceil(Math.sqrt(pieceCount * (4 / 3)));
  const rows = Math.ceil(pieceCount / cols);
  return { rows, cols };
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
  );
}

/**
 * Check if a position is within snap threshold of target
 */
export function isNearPosition(
  position: Position,
  target: Position,
  threshold: number
): boolean {
  return calculateDistance(position, target) < threshold;
}

/**
 * Snap position to grid
 */
export function snapToGrid(position: Position, gridSize: number): Position {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Calculate piece dimensions based on image size and grid
 */
export function calculatePieceDimensions(
  imageWidth: number,
  imageHeight: number,
  rows: number,
  cols: number
): { width: number; height: number } {
  return {
    width: imageWidth / cols,
    height: imageHeight / rows,
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format time duration to MM:SS
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get optimal piece count for device screen size
 */
export function getOptimalPieceCount(screenWidth: number): number {
  if (screenWidth < 768) {
    return 12; // Mobile
  } else if (screenWidth < 1024) {
    return 48; // Tablet
  } else {
    return 120; // Desktop
  }
}
