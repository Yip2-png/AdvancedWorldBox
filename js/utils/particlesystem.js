/**
 * Particle System for Visual Effects
 * Handles creation, updates, and rendering of particles
 */

class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.gravity = 0.1;
    this.friction = 0.98;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    
    this.x += this.vx;
    this.y += this.vy;
    
    this.life -= 1;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, options = {}) {
    const {
      vx = 0,
      vy = 0,
      vxVar = 2,
      vyVar = 2,
      life = 30,
      lifeVar = 10,
      color = '#ffffff',
      size = 3,
      sizeVar = 1
    } = options;

    for (let i = 0; i < count; i++) {
      const particleVx = vx + (Math.random() - 0.5) * vxVar;
      const particleVy = vy + (Math.random() - 0.5) * vyVar;
      const particleLife = life + (Math.random() - 0.5) * lifeVar;
      const particleSize = size + (Math.random() - 0.5) * sizeVar;

      this.particles.push(
        new Particle(x, y, particleVx, particleVy, particleLife, color, particleSize)
      );
    }
  }

  emitExplosion(x, y, count, speed, color) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push(
        new Particle(x, y, vx, vy, 40, color, 4)
      );
    }
  }

  emitLine(x1, y1, x2, y2, count, color) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = MathUtils.lerp(x1, x2, t);
      const y = MathUtils.lerp(y1, y2, t);
      
      const vx = (Math.random() - 0.5) * 4;
      const vy = (Math.random() - 0.5) * 4 - 1;
      
      this.particles.push(
        new Particle(x, y, vx, vy, 30, color, 2)
      );
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  getCount() {
    return this.particles.length;
  }
}
