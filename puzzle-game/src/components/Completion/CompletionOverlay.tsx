import { useNavigate } from 'react-router-dom';
import { usePuzzleStore } from '../../store';
import { Button } from '../shared';
import { ConfettiAnimation } from './ConfettiAnimation';
import { formatDuration } from '../../utils';

export function CompletionOverlay() {
  const navigate = useNavigate();
  const startTime = usePuzzleStore((state) => state.startTime);
  const endTime = usePuzzleStore((state) => state.endTime);
  const startNewGame = usePuzzleStore((state) => state.startNewGame);

  const duration =
    startTime && endTime ? formatDuration(endTime - startTime) : '0:00';

  const handleNewPuzzle = () => {
    startNewGame();
    navigate('/');
  };

  return (
    <>
      <ConfettiAnimation active={true} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-puzzle-success rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-gray-600">
              You completed the puzzle in {duration}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleNewPuzzle} size="lg" className="w-full">
              New Puzzle
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
