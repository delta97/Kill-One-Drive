import { useEffect } from 'react';
import { usePuzzleStore } from '../store';
import { SoundManager } from '../services';

export function usePuzzleCompletion() {
  const pieces = usePuzzleStore((state) => state.pieces);
  const isCompleted = usePuzzleStore((state) => state.isCompleted);
  const checkCompletion = usePuzzleStore((state) => state.checkCompletion);

  useEffect(() => {
    if (pieces.length === 0) return;

    const allPlaced = pieces.every((piece) => piece.isPlaced);

    if (allPlaced && !isCompleted) {
      checkCompletion();
      triggerCelebration();
    }
  }, [pieces, isCompleted, checkCompletion]);
}

function triggerCelebration() {
  // Play completion sound
  SoundManager.play('completion', 0.5);

  // Haptic feedback on mobile
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}
