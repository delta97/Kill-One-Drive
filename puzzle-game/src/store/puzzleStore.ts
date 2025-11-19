import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PuzzlePiece, PuzzleConfig, Position, Difficulty } from '../types';
import { DIFFICULTY_PRESETS } from '../utils';

interface PuzzleState {
  // Image state
  originalImage: File | null;
  imageUrl: string | null;

  // Puzzle configuration
  config: PuzzleConfig;

  // Game state
  pieces: PuzzlePiece[];
  placedPieces: Set<string>;
  startTime: number | null;
  endTime: number | null;
  isCompleted: boolean;

  // Actions
  setImage: (file: File) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPieceCount: (count: number) => void;
  setShuffled: (shuffled: boolean) => void;
  setConfig: (config: PuzzleConfig) => void;
  setPieces: (pieces: PuzzlePiece[]) => void;
  updatePiecePosition: (id: string, position: Position, isPlaced: boolean) => void;
  checkCompletion: () => void;
  resetPuzzle: () => void;
  startNewGame: () => void;
}

const initialConfig: PuzzleConfig = {
  difficulty: 'medium',
  pieceCount: DIFFICULTY_PRESETS.medium,
  shuffled: true,
};

export const usePuzzleStore = create<PuzzleState>()(
  devtools(
    persist(
      (set, get) => ({
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

        setDifficulty: (difficulty) => {
          const pieceCount = DIFFICULTY_PRESETS[difficulty];
          set((state) => ({
            config: {
              ...state.config,
              difficulty,
              pieceCount: difficulty === 'custom' ? state.config.pieceCount : pieceCount,
            },
          }));
        },

        setPieceCount: (count) =>
          set((state) => ({
            config: { ...state.config, pieceCount: count },
          })),

        setShuffled: (shuffled) =>
          set((state) => ({
            config: { ...state.config, shuffled },
          })),

        setConfig: (config) => set({ config }),

        setPieces: (pieces) =>
          set({
            pieces,
            startTime: Date.now(),
            isCompleted: false,
            placedPieces: new Set(),
          }),

        updatePiecePosition: (id, position, isPlaced) =>
          set((state) => {
            const updatedPieces = state.pieces.map((piece) =>
              piece.id === id
                ? { ...piece, currentPosition: position, isPlaced }
                : piece
            );

            const newPlacedPieces = new Set(state.placedPieces);
            if (isPlaced) {
              newPlacedPieces.add(id);
            } else {
              newPlacedPieces.delete(id);
            }

            return {
              pieces: updatedPieces,
              placedPieces: newPlacedPieces,
            };
          }),

        checkCompletion: () =>
          set((state) => {
            const allPlaced = state.pieces.every((piece) => piece.isPlaced);
            if (allPlaced && !state.isCompleted && state.pieces.length > 0) {
              return {
                isCompleted: true,
                endTime: Date.now(),
              };
            }
            return state;
          }),

        resetPuzzle: () =>
          set({
            pieces: [],
            placedPieces: new Set(),
            startTime: null,
            endTime: null,
            isCompleted: false,
          }),

        startNewGame: () => {
          const { imageUrl } = get();
          if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
          }
          set({
            originalImage: null,
            imageUrl: null,
            pieces: [],
            placedPieces: new Set(),
            startTime: null,
            endTime: null,
            isCompleted: false,
            config: initialConfig,
          });
        },
      }),
      {
        name: 'puzzle-storage',
        partialize: (state) => ({
          config: state.config,
        }),
      }
    )
  )
);
