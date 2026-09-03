/**
 * Entity Base Class
 * Foundation for all game entities
 */

class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.scale = 1;
    this.alpha = 1;
    this.color = '#ffffff';
    this.type = 'entity';
    this.id = Math.random().toString(36).substr(2, 9);
    this.health = 100;
    this.maxHealth = 100;
    this.energy = 100;
    this.maxEnergy = 100;
    this.experience = 0;
    this.level = 1;
    this.isActive = true;
    this.effects = new Map();
    this.statusEffects = [];
  }

  /**
   * Update entity
   */
  update(world) {
    if (!this.isActive) return;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Apply friction
    this.vx *= 0.95;
    this.vy *= 0.95;

    // Update effects
    this.updateStatusEffects();

    // Natural energy regeneration
    this.energy = Math.min(this.maxEnergy, this.energy + 0.5);
  }

  /**
   * Take damage
   */
  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }

  /**
   * Heal entity
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Use energy
   */
  useEnergy(amount) {
    if (this.energy >= amount) {
      this.energy -= amount;
      return true;
    }
    return false;
  }

  /**
   * Add status effect
   */
  addStatusEffect(effect) {
    this.statusEffects.push(effect);
  }

  /**
   * Update status effects
   */
  updateStatusEffects() {
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      effect.duration--;

      if (effect.duration <= 0) {
        this.statusEffects.splice(i, 1);
      }
    }
  }

  /**
   * Check if entity has effect
   */
  hasEffect(effectType) {
    return this.statusEffects.some(e => e.type === effectType);
  }

  /**
   * Get bounding box
   */
  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Check collision with another entity
   */
  collidesWith(other) {
    return MathUtils.rectsCollide(
      this.x - this.width / 2, this.y - this.height / 2, this.width, this.height,
      other.x - other.width / 2, other.y - other.height / 2, other.width, other.height
    );
  }

  /**
   * Get distance to entity
   */
  distanceTo(other) {
    return MathUtils.distance(this.x, this.y, other.x, other.y);
  }

  /**
   * Draw entity
   */
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  /**
   * Check if dead
   */
  isDead() {
    return this.health <= 0;
  }
}

/**
 * Status Effect Class
 */
class StatusEffect {
  constructor(type, duration, properties = {}) {
    this.type = type; // poison, stun, buff, debuff, etc.
    this.duration = duration;
    this.originalDuration = duration;
    this.properties = properties;
  }

  /**
   * Apply effect
   */
  apply(entity) {
    if (this.properties.damagePerTurn) {
      entity.takeDamage(this.properties.damagePerTurn);
    }
    if (this.properties.speedMultiplier) {
      entity.vx *= this.properties.speedMultiplier;
      entity.vy *= this.properties.speedMultiplier;
    }
  }

  /**
   * Get remaining duration percentage
   */
  getProgress() {
    return this.duration / this.originalDuration;
  }
}
