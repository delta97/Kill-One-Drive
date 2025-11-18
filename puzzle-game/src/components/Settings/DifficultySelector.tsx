import type { Difficulty } from '../../types';
import { DIFFICULTY_PRESETS } from '../../utils';

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

export function DifficultySelector({ selected, onChange }: DifficultySelectorProps) {
  const difficulties: Array<{ value: Difficulty; label: string; pieces: number }> = [
    { value: 'easy', label: 'Easy', pieces: DIFFICULTY_PRESETS.easy },
    { value: 'medium', label: 'Medium', pieces: DIFFICULTY_PRESETS.medium },
    { value: 'hard', label: 'Hard', pieces: DIFFICULTY_PRESETS.hard },
    { value: 'custom', label: 'Custom', pieces: 0 },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Difficulty Level
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {difficulties.map(({ value, label, pieces }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${
                selected === value
                  ? 'border-puzzle-primary bg-blue-50 text-puzzle-primary'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }
            `}
          >
            <div className="font-semibold">{label}</div>
            {value !== 'custom' && (
              <div className="text-xs mt-1 opacity-75">{pieces} pieces</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
