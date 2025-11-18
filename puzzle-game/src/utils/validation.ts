import {
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  MIN_PIECE_COUNT,
  MAX_PIECE_COUNT,
} from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file
 */
export function validateImage(file: File): ValidationResult {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check accepted image types
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are supported',
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate piece count
 */
export function validatePieceCount(count: number): ValidationResult {
  if (count < MIN_PIECE_COUNT) {
    return {
      valid: false,
      error: `Piece count must be at least ${MIN_PIECE_COUNT}`,
    };
  }

  if (count > MAX_PIECE_COUNT) {
    return {
      valid: false,
      error: `Piece count must be at most ${MAX_PIECE_COUNT}`,
    };
  }

  return { valid: true };
}

/**
 * Validate puzzle configuration
 */
export function validatePuzzleConfig(
  pieceCount: number,
  imageFile: File | null
): ValidationResult {
  if (!imageFile) {
    return { valid: false, error: 'Please select an image first' };
  }

  const imageValidation = validateImage(imageFile);
  if (!imageValidation.valid) {
    return imageValidation;
  }

  const pieceCountValidation = validatePieceCount(pieceCount);
  if (!pieceCountValidation.valid) {
    return pieceCountValidation;
  }

  return { valid: true };
}
