/**
 * Creature System - Animals and monsters
 * Advanced behavior and AI
 */

class Creature extends Entity {
  constructor(x, y, type = 'wolf') {
    super(x, y, 16, 16);
    this.creatureType = type;
    this.species = type;
    this.gender = Math.random() < 0.5 ? 'male' : 'female';
    this.age = 0;
    this.lifespan = this.getLifespan();
    this.diet = this.getDiet(); // herbivore, carnivore, omnivore
    this.hunger = 100;
    this.thirst = 100;
    this.reproduction = this.getReproductionRate();
    this.reproductionReady = false;
    this.territoryCenter = { x, y };
    this.territoryRadius = 100;
    this.target = null;
    this.targetType = null; // 'food', 'water', 'mate', 'threat'
    this.behavior = 'idle'; // idle, hunt, graze, flee, sleep
    this.speed = this.getSpeed();
    this.strength = this.getStrength();
    this.perception = this.getPerception();
    this.color = this.getColor();
    this.scale = this.getScale();
    this.herd = null; // For herding creatures
  }

  /**
   * Update creature AI and behavior
   */
  update(world) {
    super.update(world);

    this.age++;
    this.hunger = Math.max(0, this.hunger - 0.5);
    this.thirst = Math.max(0, this.thirst - 0.3);

    // Age-based health decline
    if (this.age > this.lifespan * 0.8) {
      this.health -= 0.2;
    }

    // Death conditions
    if (this.health <= 0 || this.hunger <= 0 || this.thirst <= 0 || this.age >= this.lifespan) {
      this.health = 0;
      return;
    }

    // Reproduction check
    if (this.age > this.lifespan * 0.3 && this.age < this.lifespan * 0.7) {
      if (this.hunger > 60 && this.thirst > 60 && this.health > 60) {
        this.reproductionReady = true;
      } else {
        this.reproductionReady = false;
      }
    }

    // AI behavior
    this.updateAI(world);
    this.updateMovement(world);
  }

  /**
   * Update creature AI
   */
  updateAI(world) {
    const nearbyCreatures = world.getCreaturesInArea(this.x, this.y, this.perception);
    const nearbyEntities = world.getEntitiesInArea(this.x, this.y, this.perception);

    // Thirst priority
    if (this.thirst < 30) {
      this.behavior = 'seeking_water';
      this.findNearestWater(world);
      return;
    }

    // Hunger priority
    if (this.hunger < 30) {
      this.behavior = 'hunting';
      this.findFood(world, nearbyCreatures, nearbyEntities);
      return;
    }

    // Mating
    if (this.reproductionReady) {
      const mate = this.findMate(nearbyCreatures);
      if (mate) {
        this.behavior = 'mating';
        this.target = mate;
        return;
      }
    }

    // Flee from predators
    const threat = this.checkForThreats(nearbyCreatures);
    if (threat) {
      this.behavior = 'fleeing';
      this.target = threat;
      return;
    }

    // Grazing/Idle
    this.behavior = 'grazing';
    this.target = null;
  }

  /**
   * Update movement based on behavior
   */
  updateMovement(world) {
    switch (this.behavior) {
      case 'hunting':
      case 'seeking_water':
        if (this.target) {
          this.moveTowards(this.target);
        } else {
          this.moveRandomly();
        }
        break;
      case 'mating':
        if (this.target) {
          this.moveTowards(this.target);
          if (this.distanceTo(this.target) < 20) {
            this.mate(this.target);
          }
        }
        break;
      case 'fleeing':
        if (this.target) {
          this.moveAwayFrom(this.target);
        } else {
          this.moveRandomly();
        }
        break;
      case 'grazing':
      default:
        if (Math.random() < 0.02) {
          this.moveRandomly();
        }
        break;
    }
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
   * Move away from target
   */
  moveAwayFrom(target) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      this.vx = (dx / dist) * this.speed * 1.5;
      this.vy = (dy / dist) * this.speed * 1.5;
    }
  }

  /**
   * Move randomly
   */
  moveRandomly() {
    if (Math.random() < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.5);
      this.vy = Math.sin(angle) * (this.speed * 0.5);
    }
  }

  /**
   * Find nearest water
   */
  findNearestWater(world) {
    for (let i = 0; i < world.tiles.length; i++) {
      for (let j = 0; j < world.tiles[i].length; j++) {
        const tile = world.tiles[i][j];
        if (tile.type === 'water') {
          const coords = tile.getWorldCoords();
          if (MathUtils.distance(this.x, this.y, coords.x, coords.y) < this.perception) {
            this.target = coords;
            return;
          }
        }
      }
    }
  }

  /**
   * Find food
   */
  findFood(world, creatures, entities) {
    if (this.diet === 'herbivore') {
      // Look for vegetation
      for (let i = 0; i < world.tiles.length; i++) {
        for (let j = 0; j < world.tiles[i].length; j++) {
          const tile = world.tiles[i][j];
          if (tile.vegetation && tile.vegetationDensity > 0.5) {
            const coords = tile.getWorldCoords();
            if (MathUtils.distance(this.x, this.y, coords.x, coords.y) < this.perception) {
              this.target = coords;
              return;
            }
          }
        }
      }
    } else if (this.diet === 'carnivore') {
      // Look for other creatures
      const prey = creatures.filter(c => 
        c !== this && 
        (c.diet === 'herbivore' || c.diet === 'omnivore') &&
        c.health > 0
      );
      if (prey.length > 0) {
        this.target = prey[0];
      }
    }
  }

  /**
   * Check for threats
   */
  checkForThreats(creatures) {
    const predators = creatures.filter(c => 
      c !== this && 
      c.diet === 'carnivore' &&
      c.health > 0 &&
      c.strength > this.strength
    );
    
    return predators.length > 0 ? predators[0] : null;
  }

  /**
   * Find mate
   */
  findMate(creatures) {
    const potentialMates = creatures.filter(c => 
      c !== this &&
      c.species === this.species &&
      c.gender !== this.gender &&
      c.reproductionReady &&
      c.health > 60
    );
    
    return potentialMates.length > 0 ? potentialMates[0] : null;
  }

  /**
   * Reproduce
   */
  mate(other) {
    if (this.gender === 'female') {
      this.hunger -= 20;
      this.energy -= 30;
      this.reproductionReady = false;
      // Baby would be created by world system
      return true;
    }
  }

  /**
   * Consume food
   */
  eatFood(nutrition) {
    this.hunger = Math.min(100, this.hunger + nutrition);
  }

  /**
   * Drink water
   */
  drinkWater() {
    this.thirst = Math.min(100, this.thirst + 50);
  }

  /**
   * Get creature lifespan
   */
  getLifespan() {
    const lifespans = {
      'wolf': 800,
      'deer': 700,
      'bear': 900,
      'rabbit': 500,
      'eagle': 1200,
      'fish': 400,
      'dragon': 5000
    };
    return lifespans[this.species] || 600;
  }

  /**
   * Get diet type
   */
  getDiet() {
    const diets = {
      'wolf': 'carnivore',
      'deer': 'herbivore',
      'bear': 'omnivore',
      'rabbit': 'herbivore',
      'eagle': 'carnivore',
      'fish': 'omnivore',
      'dragon': 'carnivore'
    };
    return diets[this.species] || 'omnivore';
  }

  /**
   * Get reproduction rate
   */
  getReproductionRate() {
    const rates = {
      'wolf': 0.3,
      'deer': 0.5,
      'bear': 0.1,
      'rabbit': 0.8,
      'eagle': 0.2,
      'fish': 0.6,
      'dragon': 0.05
    };
    return rates[this.species] || 0.3;
  }

  /**
   * Get speed
   */
  getSpeed() {
    const speeds = {
      'wolf': 2.5,
      'deer': 3,
      'bear': 2,
      'rabbit': 2.8,
      'eagle': 3.5,
      'fish': 1.5,
      'dragon': 2.2
    };
    return speeds[this.species] || 2;
  }

  /**
   * Get strength
   */
  getStrength() {
    const strengths = {
      'wolf': 7,
      'deer': 3,
      'bear': 9,
      'rabbit': 1,
      'eagle': 5,
      'fish': 2,
      'dragon': 10
    };
    return strengths[this.species] || 5;
  }

  /**
   * Get perception range
   */
  getPerception() {
    const perceptions = {
      'wolf': 200,
      'deer': 250,
      'bear': 200,
      'rabbit': 150,
      'eagle': 400,
      'fish': 100,
      'dragon': 500
    };
    return perceptions[this.species] || 150;
  }

  /**
   * Get color
   */
  getColor() {
    const colors = {
      'wolf': '#333333',
      'deer': '#8B4513',
      'bear': '#4A3728',
      'rabbit': '#FFFACD',
      'eagle': '#DAA520',
      'fish': '#87CEEB',
      'dragon': '#DC143C'
    };
    return colors[this.species] || '#CCCCCC';
  }

  /**
   * Get scale
   */
  getScale() {
    const scales = {
      'wolf': 1.2,
      'deer': 1,
      'bear': 1.5,
      'rabbit': 0.7,
      'eagle': 0.9,
      'fish': 0.6,
      'dragon': 2
    };
    return scales[this.species] || 1;
  }

  /**
   * Draw creature with improved graphics
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    
    // Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(6, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(8, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#00FF00';
    if (healthPercent < 0.5) ctx.fillStyle = '#FFFF00';
    if (healthPercent < 0.25) ctx.fillStyle = '#FF0000';
    ctx.fillRect(-8, -15, 16 * healthPercent, 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(-8, -15, 16, 2);
    
    ctx.restore();
  }
}
