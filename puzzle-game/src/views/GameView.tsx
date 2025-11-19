import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzleStore } from '../store';
import { GameHeader, PuzzleBoard } from '../components/Game';
import { CompletionOverlay } from '../components/Completion';
import { usePuzzleCompletion } from '../hooks';

export function GameView() {
  const navigate = useNavigate();
  const pieces = usePuzzleStore((state) => state.pieces);
  const isCompleted = usePuzzleStore((state) => state.isCompleted);

  // Auto-check completion
  usePuzzleCompletion();

  // Redirect if no pieces
  useEffect(() => {
    if (pieces.length === 0) {
      navigate('/');
    }
  }, [pieces, navigate]);

  if (pieces.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GameHeader />
      <PuzzleBoard />
      {isCompleted && <CompletionOverlay />}
    </div>
  );
}
