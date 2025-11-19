import { create } from 'zustand';

interface PuzzlePiece {
  id: string;
  row: number;
  col: number;
  correctPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  shape: number[][];
  imageData: string;
  width: number;
  height: number;
}

interface PuzzleConfig {
  rows: number;
  cols: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PuzzleStore {
  // State
  originalImage: File | null;
  imageUrl: string | null;
  config: PuzzleConfig;
  pieces: PuzzlePiece[];
  placedPieces: Set<string>;
  startTime: number | null;
  endTime: number | null;
  isCompleted: boolean;

  // Actions
  setImage: (file: File) => void;
  setConfig: (config: PuzzleConfig) => void;
  setPieces: (pieces: PuzzlePiece[]) => void;
  placePiece: (pieceId: string) => void;
  updatePiecePosition: (pieceId: string, position: { x: number; y: number }) => void;
  startGame: () => void;
  completeGame: () => void;
  resetGame: () => void;
}

const initialConfig: PuzzleConfig = {
  rows: 3,
  cols: 3,
  difficulty: 'easy',
};

export const usePuzzleStore = create<PuzzleStore>((set, get) => ({
  // Initial state
  originalImage: null,
  imageUrl: null,
  config: initialConfig,
  pieces: [],
  placedPieces: new Set(),
  startTime: null,
  endTime: null,
  isCompleted: false,

  // Actions
  setImage: (file) => {
    // FIX: Revoke the old URL before creating a new one to prevent memory leak
    const currentUrl = get().imageUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    const url = URL.createObjectURL(file);
    set({ originalImage: file, imageUrl: url });
  },

  setConfig: (config) => set({ config }),

  setPieces: (pieces) => set({ pieces }),

  placePiece: (pieceId) => {
    const placedPieces = new Set(get().placedPieces);
    placedPieces.add(pieceId);
    set({ placedPieces });
  },

  updatePiecePosition: (pieceId, position) => {
    const pieces = get().pieces.map((piece) =>
      piece.id === pieceId
        ? { ...piece, currentPosition: position }
        : piece
    );
    set({ pieces });
  },

  startGame: () => set({ startTime: Date.now(), isCompleted: false }),

  completeGame: () => set({ endTime: Date.now(), isCompleted: true }),

  resetGame: () => {
    // Clean up the current image URL when resetting
    const currentUrl = get().imageUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    set({
      originalImage: null,
      imageUrl: null,
      pieces: [],
      placedPieces: new Set(),
      startTime: null,
      endTime: null,
      isCompleted: false,
    });
  },
}));
