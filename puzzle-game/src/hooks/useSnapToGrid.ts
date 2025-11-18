import { useCallback } from 'react';
import type { PuzzlePiece, Position } from '../types';
import { usePuzzleStore } from '../store';
import { isNearPosition, SNAP_THRESHOLD } from '../utils';
import { SoundManager } from '../services';

export function useSnapToGrid() {
  const updatePiecePosition = usePuzzleStore((state) => state.updatePiecePosition);
  const checkCompletion = usePuzzleStore((state) => state.checkCompletion);

  const checkSnap = useCallback(
    (piece: PuzzlePiece, newPosition: Position): { shouldSnap: boolean; snapPosition?: Position } => {
      if (isNearPosition(newPosition, piece.correctPosition, SNAP_THRESHOLD)) {
        return {
          shouldSnap: true,
          snapPosition: piece.correctPosition,
        };
      }

      return { shouldSnap: false };
    },
    []
  );

  const handleDrop = useCallback(
    (pieceId: string, position: Position) => {
      const pieces = usePuzzleStore.getState().pieces;
      const piece = pieces.find((p) => p.id === pieceId);

      if (!piece) return;

      const { shouldSnap, snapPosition } = checkSnap(piece, position);

      if (shouldSnap && snapPosition) {
        updatePiecePosition(pieceId, snapPosition, true);
        SoundManager.play('snap', 0.3);

        // Check if puzzle is completed
        setTimeout(() => {
          checkCompletion();
        }, 100);
      } else {
        updatePiecePosition(pieceId, position, false);
      }
    },
    [checkSnap, updatePiecePosition, checkCompletion]
  );

  return { handleDrop, checkSnap };
}
