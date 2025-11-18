import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzleStore } from '../store';
import { DifficultySelector, CustomSlider, ShuffleToggle } from '../components/Settings';
import { Button, LoadingSpinner } from '../components/shared';
import { PuzzleGenerator } from '../services';

export function SettingsView() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalImage = usePuzzleStore((state) => state.originalImage);
  const imageUrl = usePuzzleStore((state) => state.imageUrl);
  const config = usePuzzleStore((state) => state.config);
  const setDifficulty = usePuzzleStore((state) => state.setDifficulty);
  const setPieceCount = usePuzzleStore((state) => state.setPieceCount);
  const setShuffled = usePuzzleStore((state) => state.setShuffled);
  const setPieces = usePuzzleStore((state) => state.setPieces);

  // Redirect if no image
  useEffect(() => {
    if (!originalImage) {
      navigate('/');
    }
  }, [originalImage, navigate]);

  const handleStartPuzzle = async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generator = new PuzzleGenerator();
      const pieces = await generator.generatePuzzle(originalImage, config);
      setPieces(pieces);
      navigate('/game');
    } catch (err) {
      console.error('Failed to generate puzzle:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate puzzle');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Puzzle Settings</h2>
          <p className="text-gray-600">Customize your puzzle experience</p>
        </div>

        {/* Image Preview */}
        <div className="rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Puzzle preview"
            className="w-full h-48 object-cover"
          />
        </div>

        {/* Settings */}
        <DifficultySelector selected={config.difficulty} onChange={setDifficulty} />

        {config.difficulty === 'custom' && (
          <CustomSlider value={config.pieceCount} onChange={setPieceCount} />
        )}

        <ShuffleToggle enabled={config.shuffled} onChange={setShuffled} />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate('/')} disabled={isGenerating}>
            Back
          </Button>
          <Button
            onClick={handleStartPuzzle}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Generating...
              </span>
            ) : (
              'Start Puzzle'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
