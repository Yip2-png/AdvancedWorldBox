/**
 * Building System
 * Manage buildings and structures
 */

class Building {
  constructor(x, y, type = 'house') {
    this.x = x;
    this.y = y;
    this.type = type; // house, farm, barracks, temple, tower, market, workshop, storage
    this.civilization = null;
    this.width = this.getWidth();
    this.height = this.getHeight();
    this.health = this.getMaxHealth();
    this.maxHealth = this.getMaxHealth();
    this.level = 1;
    this.workers = [];
    this.maxWorkers = this.getMaxWorkers();
    this.production = this.getProduction();
    this.storage = 0;
    this.maxStorage = this.getMaxStorage();
    this.cost = this.getBuildingCost();
    this.constructionProgress = 0;
    this.isConstructed = false;
    this.population = 0;
    this.maxPopulation = this.getMaxPopulation();
  }

  /**
   * Update building
   */
  update(civilization) {
    if (!this.isConstructed) {
      this.constructionProgress += 10;
      if (this.constructionProgress >= this.cost) {
        this.isConstructed = true;
        this.constructionProgress = 0;
      }
      return;
    }

    // Produce resources
    this.produce();

    // Consume resources
    this.consume(civilization);
  }

  /**
   * Produce resources
   */
  produce() {
    switch (this.type) {
      case 'farm':
        this.storage += 50 * this.workers.length;
        break;
      case 'mine':
        this.storage += 20 * this.workers.length;
        break;
      case 'workshop':
        this.storage += 10 * this.workers.length;
        break;
      case 'temple':
        // Produces culture/happiness
        break;
    }

    this.storage = Math.min(this.storage, this.maxStorage);
  }

  /**
   * Consume resources
   */
  consume(civilization) {
    const maintenanceCost = 5;
    if (civilization.economy >= maintenanceCost) {
      civilization.economy -= maintenanceCost;
    } else {
      this.health -= 1;
    }
  }

  /**
   * Add worker
   */
  addWorker(citizen) {
    if (this.workers.length < this.maxWorkers) {
      this.workers.push(citizen);
      citizen.job = this.getJobType();
      return true;
    }
    return false;
  }

  /**
   * Remove worker
   */
  removeWorker(citizen) {
    const index = this.workers.indexOf(citizen);
    if (index > -1) {
      this.workers.splice(index, 1);
      citizen.job = null;
      return true;
    }
    return false;
  }

  /**
   * Upgrade building
   */
  upgrade() {
    this.level++;
    this.maxWorkers = Math.floor(this.maxWorkers * 1.2);
    this.maxStorage = Math.floor(this.maxStorage * 1.3);
    this.health = this.maxHealth;
  }

  /**
   * Damage building
   */
  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    return this.health <= 0;
  }

  /**
   * Repair building
   */
  repair(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Get width
   */
  getWidth() {
    const widths = {
      'house': 32, 'farm': 64, 'barracks': 64, 'temple': 64,
      'tower': 32, 'market': 48, 'workshop': 48, 'storage': 48
    };
    return widths[this.type] || 32;
  }

  /**
   * Get height
   */
  getHeight() {
    const heights = {
      'house': 32, 'farm': 64, 'barracks': 64, 'temple': 64,
      'tower': 32, 'market': 48, 'workshop': 48, 'storage': 48
    };
    return heights[this.type] || 32;
  }

  /**
   * Get max health
   */
  getMaxHealth() {
    const health = {
      'house': 50, 'farm': 100, 'barracks': 150, 'temple': 100,
      'tower': 200, 'market': 80, 'workshop': 90, 'storage': 120
    };
    return health[this.type] || 50;
  }

  /**
   * Get max workers
   */
  getMaxWorkers() {
    const workers = {
      'house': 0, 'farm': 5, 'barracks': 10, 'temple': 3,
      'tower': 2, 'market': 4, 'workshop': 6, 'storage': 2
    };
    return workers[this.type] || 0;
  }

  /**
   * Get production rate
   */
  getProduction() {
    const production = {
      'house': 0, 'farm': 50, 'barracks': 20, 'temple': 10,
      'tower': 5, 'market': 15, 'workshop': 25, 'storage': 0
    };
    return production[this.type] || 0;
  }

  /**
   * Get max storage
   */
  getMaxStorage() {
    const storage = {
      'house': 0, 'farm': 500, 'barracks': 100, 'temple': 50,
      'tower': 20, 'market': 300, 'workshop': 150, 'storage': 1000
    };
    return storage[this.type] || 0;
  }

  /**
   * Get max population
   */
  getMaxPopulation() {
    const population = {
      'house': 5, 'farm': 0, 'barracks': 0, 'temple': 0,
      'tower': 0, 'market': 0, 'workshop': 0, 'storage': 0
    };
    return population[this.type] || 0;
  }

  /**
   * Get building cost
   */
  getBuildingCost() {
    const costs = {
      'house': 50, 'farm': 100, 'barracks': 150, 'temple': 200,
      'tower': 180, 'market': 120, 'workshop': 140, 'storage': 110
    };
    return costs[this.type] || 50;
  }

  /**
   * Get job type for workers
   */
  getJobType() {
    const jobMap = {
      'house': null, 'farm': 'farmer', 'barracks': 'soldier', 'temple': 'priest',
      'tower': 'guard', 'market': 'merchant', 'workshop': 'craftsman', 'storage': 'porter'
    };
    return jobMap[this.type] || null;
  }

  /**
   * Draw building
   */
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.isConstructed ? 1 : 0.6;
    ctx.fillStyle = this.getBuildingColor();
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // Building icon
    this.drawBuildingIcon(ctx);

    // Health bar
    if (this.health < this.maxHealth) {
      const healthPercent = this.health / this.maxHealth;
      ctx.fillStyle = '#00FF00';
      if (healthPercent < 0.5) ctx.fillStyle = '#FFFF00';
      if (healthPercent < 0.25) ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2 - 5, this.width * healthPercent, 3);
    }

    ctx.restore();
  }

  /**
   * Get building color
   */
  getBuildingColor() {
    const colors = {
      'house': '#8B4513', 'farm': '#228B22', 'barracks': '#FF0000', 'temple': '#FFD700',
      'tower': '#696969', 'market': '#FF8C00', 'workshop': '#A9A9A9', 'storage': '#CD853F'
    };
    return colors[this.type] || '#808080';
  }

  /**
   * Draw building icon
   */
  drawBuildingIcon(ctx) {
    const icons = {
      'house': '🏠',
      'farm': '🌾',
      'barracks': '⚔️',
      'temple': '⛪',
      'tower': '🗼',
      'market': '🏪',
      'workshop': '🔨',
      'storage': '📦'
    };
    const icon = icons[this.type];
    if (icon) {
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, this.x, this.y);
    }
  }
}
