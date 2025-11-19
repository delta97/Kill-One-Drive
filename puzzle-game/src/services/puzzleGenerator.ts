import type { PuzzlePiece, PuzzleConfig, PieceShape, Position } from '../types';
import { calculateGridDimensions, shuffleArray } from '../utils';
import { TAB_SIZE_RATIO } from '../utils/constants';
import { ImageProcessor } from './imageProcessor';

interface PieceParams {
  image: HTMLImageElement;
  row: number;
  col: number;
  rows: number;
  cols: number;
  pieceWidth: number;
  pieceHeight: number;
}

export class PuzzleGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
  }

  /**
   * Generate puzzle pieces from image
   */
  async generatePuzzle(
    imageFile: File,
    config: PuzzleConfig
  ): Promise<PuzzlePiece[]> {
    // Process image
    const image = await ImageProcessor.processImage(imageFile);

    // Calculate grid dimensions
    const { rows, cols } = calculateGridDimensions(config.pieceCount);

    const pieceWidth = image.width / cols;
    const pieceHeight = image.height / rows;

    const pieces: PuzzlePiece[] = [];

    // Generate shapes for all pieces (ensuring tabs and blanks match)
    const shapes = this.generatePieceShapes(rows, cols);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const piece = await this.generatePiece({
          image,
          row,
          col,
          rows,
          cols,
          pieceWidth,
          pieceHeight,
        }, shapes[row][col]);
        pieces.push(piece);
      }
    }

    if (config.shuffled) {
      return this.shufflePieces(pieces, image.width, image.height);
    }

    return pieces;
  }

  /**
   * Generate shapes for all pieces ensuring tabs and blanks match
   */
  private generatePieceShapes(rows: number, cols: number): PieceShape[][] {
    const shapes: PieceShape[][] = [];

    // Initialize array
    for (let row = 0; row < rows; row++) {
      shapes[row] = [];
      for (let col = 0; col < cols; col++) {
        shapes[row][col] = {
          top: 'flat',
          right: 'flat',
          bottom: 'flat',
          left: 'flat',
        };
      }
    }

    // Assign horizontal edges (left-right connections)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const isTab = Math.random() > 0.5;
        shapes[row][col].right = isTab ? 'tab' : 'blank';
        shapes[row][col + 1].left = isTab ? 'blank' : 'tab';
      }
    }

    // Assign vertical edges (top-bottom connections)
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 1; row++) {
        const isTab = Math.random() > 0.5;
        shapes[row][col].bottom = isTab ? 'tab' : 'blank';
        shapes[row + 1][col].top = isTab ? 'blank' : 'tab';
      }
    }

    return shapes;
  }

  /**
   * Generate individual puzzle piece with jigsaw shape
   */
  private async generatePiece(
    params: PieceParams,
    shape: PieceShape
  ): Promise<PuzzlePiece> {
    const { image, row, col, cols, pieceWidth, pieceHeight } = params;

    // Create piece canvas
    const pieceCanvas = this.createPieceCanvas(
      image,
      col * pieceWidth,
      row * pieceHeight,
      pieceWidth,
      pieceHeight,
      shape
    );

    // FIX: Store the actual canvas dimensions (including padding)
    // instead of just pieceWidth and pieceHeight
    return {
      id: `piece-${row}-${col}`,
      row,
      col,
      correctPosition: { x: col * pieceWidth, y: row * pieceHeight },
      currentPosition: { x: 0, y: 0 }, // Will be set by shuffle
      shape,
      imageData: pieceCanvas.toDataURL(),
      width: pieceCanvas.width,   // Fixed: Use actual canvas width with padding
      height: pieceCanvas.height, // Fixed: Use actual canvas height with padding
      isPlaced: false,
    };
  }

  /**
   * Create canvas with jigsaw piece shape
   */
  private createPieceCanvas(
    image: HTMLImageElement,
    sourceX: number,
    sourceY: number,
    width: number,
    height: number,
    shape: PieceShape
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Add padding for tabs
    const padding = width * TAB_SIZE_RATIO;
    canvas.width = width + padding * 2;
    canvas.height = height + padding * 2;

    ctx.save();
    ctx.translate(padding, padding);

    // Draw jigsaw path
    ctx.beginPath();
    this.drawJigsawPath(ctx, width, height, shape);
    ctx.closePath();
    ctx.clip();

    // Draw image portion
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      width,
      height,
      -padding,
      -padding,
      width + padding * 2,
      height + padding * 2
    );

    ctx.restore();

    // Draw border for visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.save();
    ctx.translate(padding, padding);
    ctx.beginPath();
    this.drawJigsawPath(ctx, width, height, shape);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    return canvas;
  }

  /**
   * Draw jigsaw puzzle piece path with tabs and blanks
   */
  private drawJigsawPath(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    shape: PieceShape
  ) {
    const tabSize = width * TAB_SIZE_RATIO;

    // Start at top-left corner
    ctx.moveTo(0, 0);

    // Top edge
    if (shape.top === 'tab') {
      this.drawTab(ctx, 0, 0, width, 0, tabSize, 'up');
    } else if (shape.top === 'blank') {
      this.drawBlank(ctx, 0, 0, width, 0, tabSize, 'up');
    } else {
      ctx.lineTo(width, 0);
    }

    // Right edge
    if (shape.right === 'tab') {
      this.drawTab(ctx, width, 0, width, height, tabSize, 'right');
    } else if (shape.right === 'blank') {
      this.drawBlank(ctx, width, 0, width, height, tabSize, 'right');
    } else {
      ctx.lineTo(width, height);
    }

    // Bottom edge
    if (shape.bottom === 'tab') {
      this.drawTab(ctx, width, height, 0, height, tabSize, 'down');
    } else if (shape.bottom === 'blank') {
      this.drawBlank(ctx, width, height, 0, height, tabSize, 'down');
    } else {
      ctx.lineTo(0, height);
    }

    // Left edge
    if (shape.left === 'tab') {
      this.drawTab(ctx, 0, height, 0, 0, tabSize, 'left');
    } else if (shape.left === 'blank') {
      this.drawBlank(ctx, 0, height, 0, 0, tabSize, 'left');
    } else {
      ctx.lineTo(0, 0);
    }
  }

  /**
   * Draw tab protrusion using bezier curves
   */
  private drawTab(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    size: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    if (direction === 'up' || direction === 'down') {
      // Horizontal tab
      const sign = direction === 'up' ? -1 : 1;
      const controlOffset = size * sign;

      ctx.bezierCurveTo(
        startX + (midX - startX) * 0.4,
        startY,
        midX - size / 2,
        startY + controlOffset * 0.6,
        midX - size / 3,
        startY + controlOffset
      );
      ctx.bezierCurveTo(
        midX - size / 6,
        startY + controlOffset * 1.2,
        midX + size / 6,
        startY + controlOffset * 1.2,
        midX + size / 3,
        startY + controlOffset
      );
      ctx.bezierCurveTo(
        midX + size / 2,
        startY + controlOffset * 0.6,
        midX + (endX - midX) * 0.6,
        startY,
        endX,
        endY
      );
    } else {
      // Vertical tab
      const sign = direction === 'left' ? -1 : 1;
      const controlOffset = size * sign;

      ctx.bezierCurveTo(
        startX,
        startY + (midY - startY) * 0.4,
        startX + controlOffset * 0.6,
        midY - size / 2,
        startX + controlOffset,
        midY - size / 3
      );
      ctx.bezierCurveTo(
        startX + controlOffset * 1.2,
        midY - size / 6,
        startX + controlOffset * 1.2,
        midY + size / 6,
        startX + controlOffset,
        midY + size / 3
      );
      ctx.bezierCurveTo(
        startX + controlOffset * 0.6,
        midY + size / 2,
        startX,
        midY + (endY - midY) * 0.6,
        endX,
        endY
      );
    }
  }

  /**
   * Draw blank indentation (inverse of tab)
   */
  private drawBlank(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    size: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    if (direction === 'up' || direction === 'down') {
      // Horizontal blank (inverted tab)
      const sign = direction === 'up' ? 1 : -1;
      const controlOffset = size * sign;

      ctx.bezierCurveTo(
        startX + (midX - startX) * 0.4,
        startY,
        midX - size / 2,
        startY + controlOffset * 0.6,
        midX - size / 3,
        startY + controlOffset
      );
      ctx.bezierCurveTo(
        midX - size / 6,
        startY + controlOffset * 1.2,
        midX + size / 6,
        startY + controlOffset * 1.2,
        midX + size / 3,
        startY + controlOffset
      );
      ctx.bezierCurveTo(
        midX + size / 2,
        startY + controlOffset * 0.6,
        midX + (endX - midX) * 0.6,
        startY,
        endX,
        endY
      );
    } else {
      // Vertical blank (inverted tab)
      const sign = direction === 'left' ? 1 : -1;
      const controlOffset = size * sign;

      ctx.bezierCurveTo(
        startX,
        startY + (midY - startY) * 0.4,
        startX + controlOffset * 0.6,
        midY - size / 2,
        startX + controlOffset,
        midY - size / 3
      );
      ctx.bezierCurveTo(
        startX + controlOffset * 1.2,
        midY - size / 6,
        startX + controlOffset * 1.2,
        midY + size / 6,
        startX + controlOffset,
        midY + size / 3
      );
      ctx.bezierCurveTo(
        startX + controlOffset * 0.6,
        midY + size / 2,
        startX,
        midY + (endY - midY) * 0.6,
        endX,
        endY
      );
    }
  }

  /**
   * Shuffle pieces randomly on canvas
   */
  private shufflePieces(
    pieces: PuzzlePiece[],
    canvasWidth: number,
    canvasHeight: number
  ): PuzzlePiece[] {
    const shuffled = shuffleArray(pieces);

    // Position pieces randomly
    // Now this calculation is correct because piece.width and piece.height
    // include the padding, preventing pieces from being placed partially off-canvas
    return shuffled.map((piece) => ({
      ...piece,
      currentPosition: {
        x: Math.random() * (canvasWidth - piece.width),
        y: Math.random() * (canvasHeight - piece.height),
      },
    }));
  }
}
