import { usePuzzleStore } from '../../store';
import { Button } from '../shared';
import { useNavigate } from 'react-router-dom';

export function GameHeader() {
  const navigate = useNavigate();
  const pieces = usePuzzleStore((state) => state.pieces);
  const placedCount = pieces.filter((p) => p.isPlaced).length;
  const totalCount = pieces.length;
  const percentage = totalCount > 0 ? Math.round((placedCount / totalCount) * 100) : 0;

  const handleReset = () => {
    if (confirm('Are you sure you want to start over?')) {
      navigate('/');
    }
  };

  return (
    <div className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Puzzle Game</h2>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="text-sm">
            <span className="font-semibold text-puzzle-primary">{placedCount}</span>
            <span className="text-gray-600"> / {totalCount} pieces ({percentage}%)</span>
          </div>

          {/* Reset Button */}
          <Button size="sm" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
