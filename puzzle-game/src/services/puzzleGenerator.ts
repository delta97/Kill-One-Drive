interface PuzzlePiece {
  id: string;
  row: number;
  col: number;
  correctPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  shape: number[][];
  imageData: string;
  width: number;
  height: number;
}

interface PuzzleConfig {
  rows: number;
  cols: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generates a jigsaw-style shape for a puzzle piece
 */
function generatePieceShape(
  row: number,
  col: number,
  rows: number,
  cols: number
): number[][] {
  // Simple shape generation - can be enhanced for more complex jigsaw patterns
  const shape: number[][] = [];
  const size = 10;

  for (let i = 0; i < size; i++) {
    shape[i] = [];
    for (let j = 0; j < size; j++) {
      shape[i][j] = 1;
    }
  }

  return shape;
}

/**
 * Draws a puzzle piece on a canvas with the given shape
 */
function drawPuzzlePiece(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: number[][]
): void {
  ctx.save();

  // Create clipping path based on shape
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  // Draw the image portion
  ctx.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    width,
    height
  );

  ctx.restore();
}

/**
 * Generates puzzle pieces from an image
 */
export async function generatePuzzlePieces(
  imageUrl: string,
  config: PuzzleConfig
): Promise<PuzzlePiece[]> {
  const { rows, cols } = config;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const pieces: PuzzlePiece[] = [];
      const pieceWidth = Math.floor(image.width / cols);
      const pieceHeight = Math.floor(image.height / rows);
      const padding = 20; // Padding for jigsaw edges

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Generate shape for this piece
          const shape = generatePieceShape(row, col, rows, cols);

          // Create canvas for this piece with padding
          const canvas = document.createElement('canvas');
          canvas.width = pieceWidth + padding * 2;
          canvas.height = pieceHeight + padding * 2;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw the piece with padding offset
          ctx.translate(padding, padding);
          drawPuzzlePiece(
            ctx,
            image,
            col * pieceWidth,
            row * pieceHeight,
            pieceWidth,
            pieceHeight,
            shape
          );

          // FIX: Store the actual canvas dimensions (including padding)
          // instead of just pieceWidth and pieceHeight
          pieces.push({
            id: `piece-${row}-${col}`,
            row,
            col,
            correctPosition: { x: col * pieceWidth, y: row * pieceHeight },
            currentPosition: { x: 0, y: 0 }, // Will be set by shuffle
            shape,
            imageData: canvas.toDataURL(),
            width: canvas.width,  // Fixed: Use actual canvas width with padding
            height: canvas.height, // Fixed: Use actual canvas height with padding
          });
        }
      }

      resolve(pieces);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    image.src = imageUrl;
  });
}

/**
 * Shuffles puzzle pieces to random positions within the canvas
 */
export function shufflePieces(
  pieces: PuzzlePiece[],
  canvasWidth: number,
  canvasHeight: number
): PuzzlePiece[] {
  return pieces.map((piece) => {
    // Now this calculation is correct because piece.width and piece.height
    // include the padding, preventing pieces from being placed partially off-canvas
    const x = Math.random() * (canvasWidth - piece.width);
    const y = Math.random() * (canvasHeight - piece.height);

    return {
      ...piece,
      currentPosition: { x, y },
    };
  });
}

/**
 * Checks if a piece is placed in approximately the correct position
 */
export function isPieceCorrectlyPlaced(
  piece: PuzzlePiece,
  tolerance: number = 20
): boolean {
  const dx = Math.abs(piece.currentPosition.x - piece.correctPosition.x);
  const dy = Math.abs(piece.currentPosition.y - piece.correctPosition.y);

  return dx <= tolerance && dy <= tolerance;
}

/**
 * Checks if all pieces are correctly placed
 */
export function isPuzzleComplete(pieces: PuzzlePiece[]): boolean {
  return pieces.every((piece) => isPieceCorrectlyPlaced(piece));
}
