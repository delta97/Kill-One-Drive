import { MIN_PIECE_COUNT, MAX_PIECE_COUNT } from '../../utils';

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function CustomSlider({
  value,
  onChange,
  min = MIN_PIECE_COUNT,
  max = MAX_PIECE_COUNT,
}: CustomSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">
          Number of Pieces
        </label>
        <span className="text-lg font-bold text-puzzle-primary">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-puzzle-primary"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
