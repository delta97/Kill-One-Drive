import { DndContext, DragEndEvent, PointerSensor, TouchSensor, MouseSensor, useSensors, useSensor } from '@dnd-kit/core';
import { usePuzzleStore } from '../../store';
import { PuzzlePiece } from './PuzzlePiece';
import { useSnapToGrid } from '../../hooks';

export function PuzzleBoard() {
  const pieces = usePuzzleStore((state) => state.pieces);
  const { handleDrop } = useSnapToGrid();

  // Configure sensors for multi-input support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold before drag
        tolerance: 5, // Allow 5px movement during hold
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const piece = pieces.find((p) => p.id === active.id);

    if (!piece) return;

    const newPosition = {
      x: piece.currentPosition.x + delta.x,
      y: piece.currentPosition.y + delta.y,
    };

    handleDrop(piece.id, newPosition);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="relative w-full h-full bg-gray-100 overflow-auto puzzle-canvas"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {pieces.map((piece) => (
          <PuzzlePiece key={piece.id} piece={piece} />
        ))}
      </div>
    </DndContext>
  );
}
