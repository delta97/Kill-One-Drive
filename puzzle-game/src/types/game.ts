export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface GameStats {
  moves: number;
  startTime: number | null;
  endTime: number | null;
  elapsedTime: number;
}

export interface DragState {
  isDragging: boolean;
  activePieceId: string | null;
  dragOffset: { x: number; y: number };
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface CanvasSize {
  width: number;
  height: number;
}
