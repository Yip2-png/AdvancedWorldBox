/**
 * Combat System - Advanced battle mechanics
 * Handles unit combat, damage calculation, and warfare
 */

class CombatSystem {
  constructor() {
    this.activeConflicts = [];
    this.projectiles = [];
  }

  /**
   * Calculate damage between attacker and defender
   */
  calculateDamage(attacker, defender) {
    const baseDamage = attacker.strength * 5;
    const defenderArmor = defender.strength * 0.5;
    
    // Critical hit calculation
    const criticalChance = (attacker.strength - defender.intelligence) / 100;
    const isCritical = Math.random() < criticalChance;
    const criticalMultiplier = isCritical ? 1.5 : 1;

    // Final damage
    const finalDamage = Math.max(1, (baseDamage - defenderArmor) * criticalMultiplier);
    
    return {
      damage: finalDamage,
      isCritical: isCritical,
      blocked: false
    };
  }

  /**
   * Perform attack
   */
  performAttack(attacker, defender) {
    if (!attacker || !defender) return null;

    const distance = MathUtils.distance(attacker.x, attacker.y, defender.x, defender.y);
    
    // Check if in range
    if (distance > 50) {
      return { success: false, reason: 'Out of range' };
    }

    // Check if attacker has energy
    if (!attacker.useEnergy(10)) {
      return { success: false, reason: 'Not enough energy' };
    }

    // Calculate damage
    const damageInfo = this.calculateDamage(attacker, defender);
    
    // Apply damage
    defender.takeDamage(damageInfo.damage);

    return {
      success: true,
      damage: damageInfo.damage,
      isCritical: damageInfo.isCritical,
      defender: defender
    };
  }

  /**
   * Launch projectile
   */
  launchProjectile(attacker, targetX, targetY, type = 'arrow') {
    const angle = MathUtils.angle(attacker.x, attacker.y, targetX, targetY);
    const velocity = MathUtils.velocityFromAngle(angle, 5);

    const projectile = new Projectile(
      attacker.x,
      attacker.y,
      velocity.x,
      velocity.y,
      type,
      attacker
    );

    this.projectiles.push(projectile);
    return projectile;
  }

  /**
   * Handle conflict between two units
   */
  startConflict(unit1, unit2) {
    const conflict = {
      unit1: unit1,
      unit2: unit2,
      duration: 0,
      maxDuration: 100,
      started: true
    };
    this.activeConflicts.push(conflict);
    return conflict;
  }

  /**
   * Update all conflicts
   */
  updateConflicts(world) {
    for (let i = this.activeConflicts.length - 1; i >= 0; i--) {
      const conflict = this.activeConflicts[i];
      conflict.duration++;

      const distance = MathUtils.distance(
        conflict.unit1.x, conflict.unit1.y,
        conflict.unit2.x, conflict.unit2.y
      );

      // Continue fighting or flee
      if (distance < 100 && conflict.unit1.health > 0 && conflict.unit2.health > 0) {
        // Attack
        if (conflict.duration % 10 === 0) {
          this.performAttack(conflict.unit1, conflict.unit2);
        }
        if (conflict.duration % 15 === 0) {
          this.performAttack(conflict.unit2, conflict.unit1);
        }
      } else {
        // End conflict
        this.activeConflicts.splice(i, 1);
      }
    }
  }
}

/**
 * Projectile Class
 */
class Projectile extends Entity {
  constructor(x, y, vx, vy, type = 'arrow', attacker = null) {
    super(x, y, 4, 4);
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.attacker = attacker;
    this.damage = 10;
    this.lifetime = 300;
    this.traveled = 0;
    this.maxDistance = 500;
    this.color = '#FFD700';
  }

  /**
   * Update projectile
   */
  update(world) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // Gravity
    this.lifetime--;
    this.traveled += Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    // Check collision with entities
    for (const entity of world.entities) {
      if (entity !== this.attacker && this.collidesWith(entity)) {
        entity.takeDamage(this.damage);
        this.lifetime = 0; // Destroy projectile
        break;
      }
    }
  }

  /**
   * Check if projectile is dead
   */
  isDead() {
    return this.lifetime <= 0 || this.traveled > this.maxDistance;
  }

  /**
   * Draw projectile
   */
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
