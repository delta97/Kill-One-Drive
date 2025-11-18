import { validateImage } from '../utils/validation';
import { OPTIMAL_IMAGE_SIZES, BREAKPOINTS } from '../utils/constants';
import type { Breakpoint } from '../types';

export class ImageProcessor {
  /**
   * Validate image file
   */
  static validateImage(file: File) {
    return validateImage(file);
  }

  /**
   * Load image from file
   */
  static async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image if too large
   */
  static async resizeImage(
    image: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    let { width, height } = image;

    // Calculate new dimensions maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  /**
   * Get optimal image size for device
   */
  static getOptimalSize(breakpoint?: Breakpoint): { width: number; height: number } {
    if (!breakpoint) {
      // Auto-detect breakpoint
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        breakpoint = 'mobile';
      } else if (width < BREAKPOINTS.tablet) {
        breakpoint = 'tablet';
      } else {
        breakpoint = 'desktop';
      }
    }

    return OPTIMAL_IMAGE_SIZES[breakpoint];
  }

  /**
   * Process and optimize image for puzzle generation
   */
  static async processImage(file: File): Promise<HTMLImageElement> {
    // Validate image
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Load image
    const image = await this.loadImage(file);

    // Get optimal size for current device
    const optimalSize = this.getOptimalSize();

    // Resize if needed
    if (
      image.width > optimalSize.width ||
      image.height > optimalSize.height
    ) {
      const resizedCanvas = await this.resizeImage(
        image,
        optimalSize.width,
        optimalSize.height
      );

      // Convert canvas back to image
      return new Promise((resolve) => {
        const resizedImage = new Image();
        resizedImage.onload = () => resolve(resizedImage);
        resizedImage.src = resizedCanvas.toDataURL();
      });
    }

    return image;
  }

  /**
   * Create a canvas from an image
   */
  static createCanvasFromImage(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    return canvas;
  }
}
