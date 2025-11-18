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
