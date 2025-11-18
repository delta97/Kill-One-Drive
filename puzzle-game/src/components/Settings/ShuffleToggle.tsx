interface ShuffleToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ShuffleToggle({ enabled, onChange }: ShuffleToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="text-sm font-semibold text-gray-700 block">
          Shuffle Pieces
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Randomly position pieces at the start
        </p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus:outline-none focus:ring-2 focus:ring-puzzle-primary focus:ring-offset-2
          ${enabled ? 'bg-puzzle-primary' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
