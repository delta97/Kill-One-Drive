import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { PuzzlePiece as PuzzlePieceType } from '../../types';

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
}

export function PuzzlePiece({ piece }: PuzzlePieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
    data: piece,
    disabled: piece.isPlaced,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'absolute' as const,
    left: piece.currentPosition.x,
    top: piece.currentPosition.y,
    zIndex: isDragging ? 1000 : piece.isPlaced ? 1 : 10,
    opacity: isDragging ? 0.7 : 1,
    cursor: piece.isPlaced ? 'default' : 'move',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`puzzle-piece ${piece.isPlaced ? 'pointer-events-none' : ''}`}
      data-piece-id={piece.id}
    >
      <img
        src={piece.imageData}
        alt={`Piece ${piece.id}`}
        className="block select-none"
        draggable={false}
      />
    </div>
  );
}
