/**
 * Mathematical Utilities for WorldBox Game
 * Handles various math operations, transformations, and calculations
 */

class MathUtils {
  /**
   * Get distance between two points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get distance between two objects
   */
  static distanceBetween(obj1, obj2) {
    return this.distance(obj1.x, obj1.y, obj2.x, obj2.y);
  }

  /**
   * Get angle between two points in radians
   */
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Convert radians to degrees
   */
  static toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Convert degrees to radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get random number between min and max
   */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Get random integer between min and max
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linearly interpolate between two values
   */
  static lerp(a, b, t) {
    return a + (b - a) * this.clamp(t, 0, 1);
  }

  /**
   * Smooth interpolation (easing)
   */
  static smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  /**
   * Smootherstep interpolation (smoother easing)
   */
  static smootherstep(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Get random element from array
   */
  static randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Shuffle array in place
   */
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Simple noise function using sine waves
   */
  static noise(x) {
    return Math.sin(x * 12.9898) * 43758.5453 % 1;
  }

  /**
   * Perlin-like noise (simplified)
   */
  static perlin(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Get normalized vector
   */
  static normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
  }

  /**
   * Dot product of two vectors
   */
  static dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
  }

  /**
   * Check if point is in circle
   */
  static pointInCircle(px, py, cx, cy, radius) {
    return this.distance(px, py, cx, cy) <= radius;
  }

  /**
   * Check if point is in rectangle
   */
  static pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  /**
   * Check if circles collide
   */
  static circlesCollide(x1, y1, r1, x2, y2, r2) {
    return this.distance(x1, y1, x2, y2) <= r1 + r2;
  }

  /**
   * Check if rectangles collide
   */
  static rectsCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * Get velocity vector from angle and speed
   */
  static velocityFromAngle(angle, speed) {
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  }

  /**
   * Map value from one range to another
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  /**
   * Get tile position from world position
   */
  static worldToTile(worldX, worldY, tileSize) {
    return {
      x: Math.floor(worldX / tileSize),
      y: Math.floor(worldY / tileSize)
    };
  }

  /**
   * Get world position from tile position
   */
  static tileToWorld(tileX, tileY, tileSize) {
    return {
      x: tileX * tileSize + tileSize / 2,
      y: tileY * tileSize + tileSize / 2
    };
  }

  /**
   * Get grid position for a given world position
   */
  static getGridPosition(worldX, worldY, gridSize) {
    return {
      x: Math.floor(worldX / gridSize),
      y: Math.floor(worldY / gridSize)
    };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathUtils;
}
