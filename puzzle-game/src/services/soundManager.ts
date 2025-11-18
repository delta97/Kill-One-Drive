export class SoundManager {
  private static sounds: Map<string, HTMLAudioElement> = new Map();
  private static enabled: boolean = true;

  /**
   * Preload sound effects
   */
  static preload() {
    const soundFiles = {
      snap: '/sounds/snap.mp3',
      completion: '/sounds/completion.mp3',
      pickup: '/sounds/pickup.mp3',
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      // Ignore errors if sound files don't exist
      audio.onerror = () => {
        console.warn(`Sound file not found: ${path}`);
      };
      this.sounds.set(key, audio);
    });
  }

  /**
   * Play a sound effect
   */
  static play(soundName: string, volume: number = 0.5) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume = Math.min(1, Math.max(0, volume));
      sound.currentTime = 0;
      sound.play().catch((err) => {
        console.warn('Sound play failed:', err);
      });
    }
  }

  /**
   * Enable sound effects
   */
  static enable() {
    this.enabled = true;
  }

  /**
   * Disable sound effects
   */
  static disable() {
    this.enabled = false;
  }

  /**
   * Toggle sound effects
   */
  static toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Check if sounds are enabled
   */
  static isEnabled(): boolean {
    return this.enabled;
  }
}
