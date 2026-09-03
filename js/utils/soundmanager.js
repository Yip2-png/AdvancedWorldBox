/**
 * Sound Manager for Audio
 * Handles audio playback and management
 */

class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.musicPlayers = new Map();
    this.enabled = true;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;
  }

  /**
   * Load a sound
   */
  loadSound(name, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
    return audio;
  }

  /**
   * Play a sound effect
   */
  playSound(name, volume = 1) {
    if (!this.enabled) return;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound "${name}" not found`);
      return;
    }

    try {
      const audio = sound.cloneNode();
      audio.volume = this.sfxVolume * this.masterVolume * volume;
      audio.play().catch(err => console.warn('Audio play failed:', err));
    } catch (err) {
      console.warn('Error playing sound:', err);
    }
  }

  /**
   * Play music
   */
  playMusic(name, url, loop = true) {
    if (!this.enabled) return;

    // Stop previous music
    this.stopMusic();

    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = this.musicVolume * this.masterVolume;
    audio.play().catch(err => console.warn('Music play failed:', err));

    this.musicPlayers.set(name, audio);
  }

  /**
   * Stop music
   */
  stopMusic() {
    for (const audio of this.musicPlayers.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.musicPlayers.clear();
  }

  /**
   * Stop a specific sound
   */
  stopSound(name) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = MathUtils.clamp(volume, 0, 1);
    this.updateVolumes();
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume) {
    this.sfxVolume = MathUtils.clamp(volume, 0, 1);
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = MathUtils.clamp(volume, 0, 1);
    this.updateVolumes();
  }

  /**
   * Update all volumes
   */
  updateVolumes() {
    for (const audio of this.musicPlayers.values()) {
      audio.volume = this.musicVolume * this.masterVolume;
    }
  }

  /**
   * Enable/Disable sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  /**
   * Check if sound is loaded
   */
  hasSound(name) {
    return this.sounds.has(name);
  }
}

// Global instance
const soundManager = new SoundManager();
