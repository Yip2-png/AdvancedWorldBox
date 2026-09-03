/**
 * Shader System - Visual effects and filters
 * Handles post-processing and shaders
 */

class ShaderSystem {
  constructor() {
    this.effects = new Map();
    this.initializeEffects();
  }

  /**
   * Initialize built-in effects
   */
  initializeEffects() {
    this.registerEffect('brightness', (ctx, value) => {
      ctx.globalAlpha = value;
    });

    this.registerEffect('sepia', (ctx, value) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = r * 0.393 + g * 0.769 + b * 0.189;
        data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
      }

      ctx.putImageData(imageData, 0, 0);
    });

    this.registerEffect('grayscale', (ctx) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);
    });

    this.registerEffect('blur', (ctx, radius) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.applyBoxBlur(imageData, radius);
      ctx.putImageData(imageData, 0, 0);
    });
  }

  /**
   * Register effect
   */
  registerEffect(name, callback) {
    this.effects.set(name, callback);
  }

  /**
   * Apply effect
   */
  applyEffect(ctx, effectName, ...args) {
    const effect = this.effects.get(effectName);
    if (effect) {
      effect(ctx, ...args);
    }
  }

  /**
   * Apply box blur
   */
  applyBoxBlur(imageData, radius) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = Math.min(width - 1, Math.max(0, x + dx));
            const ny = Math.min(height - 1, Math.max(0, y + dy));
            const idx = (ny * width + nx) * 4;

            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        const idx = (y * width + x) * 4;
        newData[idx] = r / count;
        newData[idx + 1] = g / count;
        newData[idx + 2] = b / count;
        newData[idx + 3] = a / count;
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = newData[i];
    }
  }

  /**
   * Create shadow effect
   */
  createShadow(ctx, x, y, size, opacity) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.5, size, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Create glow effect
   */
  createGlow(ctx, x, y, size, color) {
    ctx.save();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Create lightning effect
   */
  createLightning(ctx, x1, y1, x2, y2, segments = 15) {
    ctx.save();
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const offset = (Math.random() - 0.5) * 20;
      ctx.lineTo(x + offset, y);
    }

    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Create gradient
   */
  createGradient(ctx, x1, y1, x2, y2, colors) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  }
}
