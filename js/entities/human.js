/**
 * Human/Citizen System
 * Advanced NPC behavior and interaction
 */

class Human extends Entity {
  constructor(x, y, name = 'Citizen') {
    super(x, y, 12, 20);
    this.name = name;
    this.gender = Math.random() < 0.5 ? 'male' : 'female';
    this.age = MathUtils.randomInt(18, 60);
    this.lifespan = 80 + MathUtils.randomInt(-10, 20);
    this.civilization = null;
    this.homeBuilding = null;
    this.job = null; // farmer, soldier, builder, scholar, merchant
    this.jobLevel = 1;
    this.happiness = 75;
    this.hunger = 80;
    this.fatigue = 30;
    this.health = 100;
    this.maxHealth = 100;
    this.strength = MathUtils.randomInt(5, 15);
    this.intelligence = MathUtils.randomInt(5, 15);
    this.charisma = MathUtils.randomInt(5, 15);
    this.speed = 1.5;
    this.skills = new Map();
    this.inventory = [];
    this.maxInventory = 10;
    this.relationships = new Map();
    this.needsFood = true;
    this.needsSleep = true;
    this.needsSocial = true;
    this.color = '#FFB84D';
    this.state = 'idle'; // idle, working, sleeping, eating, moving, fighting
    this.target = null;
    this.path = [];
  }

  /**
   * Update human AI
   */
  update(world) {
    super.update(world);

    this.age += 0.00027; // Age in years per frame
    this.hunger = Math.max(0, this.hunger - 0.1);
    this.fatigue = Math.max(0, this.fatigue - 0.08);

    // Natural health decline with age
    if (this.age > this.lifespan * 0.8) {
      this.health -= 0.05;
    }

    // Damage from hunger/fatigue
    if (this.hunger <= 0 || this.fatigue >= 100) {
      this.health -= 0.5;
    }

    // Happiness affects health
    if (this.happiness < 20) {
      this.health -= 0.1;
    }

    if (this.health <= 0 || this.age >= this.lifespan) {
      this.health = 0;
      return;
    }

    // Update AI behavior
    this.updateAI(world);
  }

  /**
   * Update AI behavior
   */
  updateAI(world) {
    // Critical needs first
    if (this.hunger < 20) {
      this.state = 'seeking_food';
      this.seekFood();
      return;
    }

    if (this.fatigue > 80) {
      this.state = 'seeking_sleep';
      this.seekSleep();
      return;
    }

    // Work
    if (this.job && this.happiness > 30 && this.fatigue < 50 && this.hunger > 30) {
      this.state = 'working';
      this.doWork(world);
      return;
    }

    // Social interaction
    if (this.needsSocial && this.happiness < 70 && this.fatigue < 40) {
      this.state = 'socializing';
      this.socialize(world);
      return;
    }

    // Default: idle
    this.state = 'idle';
    if (Math.random() < 0.02) {
      this.moveRandomly();
    }
  }

  /**
   * Seek food
   */
  seekFood() {
    this.hunger = Math.min(100, this.hunger + 1);
    this.happiness = Math.max(0, this.happiness - 1);
  }

  /**
   * Seek sleep
   */
  seekSleep() {
    this.fatigue = Math.max(0, this.fatigue - 2);
    if (this.homeBuilding) {
      this.moveTowards({ x: this.homeBuilding.x, y: this.homeBuilding.y });
    }
  }

  /**
   * Do work
   */
  doWork(world) {
    this.fatigue = Math.min(100, this.fatigue + 1);
    this.hunger = Math.max(0, this.hunger - 0.5);
    this.improveSkill(this.job, 1);
  }

  /**
   * Socialize
   */
  socialize(world) {
    this.happiness = Math.min(100, this.happiness + 0.5);
    this.fatigue = Math.min(100, this.fatigue + 0.5);
  }

  /**
   * Move randomly
   */
  moveRandomly() {
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * this.speed * 0.5;
    this.vy = Math.sin(angle) * this.speed * 0.5;
  }

  /**
   * Move towards target
   */
  moveTowards(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }
  }

  /**
   * Improve skill
   */
  improveSkill(skillName, amount = 1) {
    if (!this.skills.has(skillName)) {
      this.skills.set(skillName, 0);
    }
    const current = this.skills.get(skillName);
    this.skills.set(skillName, current + amount);
  }

  /**
   * Get skill level
   */
  getSkillLevel(skillName) {
    return this.skills.get(skillName) || 0;
  }

  /**
   * Add to inventory
   */
  addToInventory(item) {
    if (this.inventory.length < this.maxInventory) {
      this.inventory.push(item);
      return true;
    }
    return false;
  }

  /**
   * Remove from inventory
   */
  removeFromInventory(index) {
    if (index >= 0 && index < this.inventory.length) {
      return this.inventory.splice(index, 1);
    }
    return null;
  }

  /**
   * Get info for display
   */
  getInfo() {
    return {
      name: this.name,
      age: Math.floor(this.age),
      gender: this.gender,
      job: this.job || 'Unemployed',
      health: Math.floor(this.health),
      happiness: Math.floor(this.happiness),
      hunger: Math.floor(this.hunger),
      fatigue: Math.floor(this.fatigue),
      state: this.state,
      skills: Array.from(this.skills.entries()).map(([name, level]) => `${name}: ${level}`)
    };
  }

  /**
   * Draw human with advanced graphics
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(-6, 0, 12, 16);
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3, -5, 2, 2);
    ctx.fillRect(1, -5, 2, 2);
    
    // State indicator (color ring)
    ctx.strokeStyle = this.getStateColor();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -4, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * Get color based on state
   */
  getStateColor() {
    switch (this.state) {
      case 'working': return '#00FF00';
      case 'seeking_food': return '#FF6600';
      case 'seeking_sleep': return '#6666FF';
      case 'socializing': return '#FF00FF';
      default: return '#FFFF00';
    }
  }
}
