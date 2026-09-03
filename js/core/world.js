/**
 * World System - Main world management
 * Handles terrain, entities, weather, and simulation
 */

class World {
  constructor(width, height, tileSize = 32) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = [];
    this.entities = [];
    this.civilizations = [];
    this.creatures = [];
    this.buildings = [];
    this.projectiles = [];
    
    // Time system
    this.year = 1;
    this.season = 0; // 0=Spring, 1=Summer, 2=Fall, 3=Winter
    this.dayOfSeason = 0;
    this.daysPerSeason = 90;
    this.timeSpeed = 1;
    this.isPaused = false;
    
    // Weather
    this.weather = new Weather();
    this.temperature = 15;
    this.humidity = 50;
    
    // Statistics
    this.stats = {
      totalPopulation: 0,
      civilizationCount: 0,
      creatureCount: 0,
      buildingCount: 0,
      totalDeaths: 0,
      totalBirths: 0,
      wars: 0,
      peacefulYears: 0
    };
    
    this.initializeTerrain();
  }

  /**
   * Initialize terrain with noise
   */
  initializeTerrain() {
    this.tiles = [];
    const tilesX = Math.ceil(this.width / this.tileSize);
    const tilesY = Math.ceil(this.height / this.tileSize);

    for (let y = 0; y < tilesY; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < tilesX; x++) {
        const noise = this.perlinNoise(x * 0.1, y * 0.1);
        const tile = new Tile(x, y, this.tileSize);
        
        // Determine terrain type based on noise
        if (noise < 0.3) {
          tile.type = 'water';
          tile.elevation = -10;
        } else if (noise < 0.4) {
          tile.type = 'sand';
          tile.elevation = 0;
        } else if (noise < 0.6) {
          tile.type = 'grass';
          tile.elevation = 5 + noise * 20;
        } else if (noise < 0.8) {
          tile.type = 'forest';
          tile.elevation = 10 + noise * 30;
          tile.vegetation = 'tree';
          tile.vegetationDensity = Math.random() * 0.8 + 0.2;
        } else {
          tile.type = 'mountain';
          tile.elevation = 50 + (noise - 0.8) * 100;
          tile.hasRock = true;
        }
        
        tile.temperature = this.temperature;
        tile.humidity = this.humidity;
        this.tiles[y][x] = tile;
      }
    }
  }

  /**
   * Simple Perlin noise implementation
   */
  perlinNoise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const n00 = this.noise(xi, yi);
    const n10 = this.noise(xi + 1, yi);
    const n01 = this.noise(xi, yi + 1);
    const n11 = this.noise(xi + 1, yi + 1);
    
    const u = this.smoothstep(xf);
    const v = this.smoothstep(yf);
    
    const nx0 = this.lerp(n00, n10, u);
    const nx1 = this.lerp(n01, n11, u);
    return this.lerp(nx0, nx1, v);
  }

  /**
   * Noise function
   */
  noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Smoothstep function
   */
  smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  /**
   * Lerp function
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Get tile at position
   */
  getTile(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    if (tileY < 0 || tileY >= this.tiles.length || 
        tileX < 0 || tileX >= this.tiles[0].length) {
      return null;
    }
    
    return this.tiles[tileY][tileX];
  }

  /**
   * Set tile type
   */
  setTile(x, y, type, options = {}) {
    const tile = this.getTile(x, y);
    if (!tile) return;
    
    tile.type = type;
    if (options.vegetation) tile.vegetation = options.vegetation;
    if (options.elevation !== undefined) tile.elevation = options.elevation;
    if (options.moisture !== undefined) tile.moisture = options.moisture;
  }

  /**
   * Update world simulation
   */
  update() {
    if (this.isPaused) return;

    // Update time
    this.updateTime();
    
    // Update weather
    this.weather.update();
    this.updateClimate();
    
    // Update entities
    this.updateEntities();
    
    // Update civilizations
    this.updateCivilizations();
    
    // Update creatures
    this.updateCreatures();
    
    // Update buildings
    this.updateBuildings();
    
    // Update projectiles
    this.updateProjectiles();
    
    // Update statistics
    this.updateStatistics();
  }

  /**
   * Update time
   */
  updateTime() {
    this.dayOfSeason += this.timeSpeed * 0.1;
    
    if (this.dayOfSeason >= this.daysPerSeason) {
      this.dayOfSeason = 0;
      this.season = (this.season + 1) % 4;
      
      if (this.season === 0) {
        this.year++;
      }
    }
  }

  /**
   * Update climate based on season
   */
  updateClimate() {
    const seasonTemps = [15, 28, 20, 5]; // Spring, Summer, Fall, Winter
    const targetTemp = seasonTemps[this.season];
    this.temperature += (targetTemp - this.temperature) * 0.02;
    
    // Update tile temperatures
    for (let row of this.tiles) {
      for (let tile of row) {
        tile.temperature = this.temperature + (Math.random() - 0.5) * 5;
        tile.humidity = this.humidity + (Math.random() - 0.5) * 10;
      }
    }
  }

  /**
   * Update all entities
   */
  updateEntities() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      entity.update(this);
      
      if (entity.isDead && entity.isDead()) {
        this.entities.splice(i, 1);
        this.stats.totalDeaths++;
      }
    }
  }

  /**
   * Update civilizations
   */
  updateCivilizations() {
    for (const civ of this.civilizations) {
      civ.update(this);
    }
  }

  /**
   * Update creatures
   */
  updateCreatures() {
    for (let i = this.creatures.length - 1; i >= 0; i--) {
      const creature = this.creatures[i];
      creature.update(this);
      
      if (creature.isDead && creature.isDead()) {
        this.creatures.splice(i, 1);
      }
    }
  }

  /**
   * Update buildings
   */
  updateBuildings() {
    for (const building of this.buildings) {
      building.update(this);
    }
  }

  /**
   * Update projectiles
   */
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(this);
      
      if (projectile.isDead && projectile.isDead()) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * Update statistics
   */
  updateStatistics() {
    this.stats.totalPopulation = this.entities.reduce((sum, e) => {
      return sum + (e instanceof Human ? 1 : 0);
    }, 0);
    
    this.stats.civilizationCount = this.civilizations.length;
    this.stats.creatureCount = this.creatures.length;
    this.stats.buildingCount = this.buildings.length;
  }

  /**
   * Add entity to world
   */
  addEntity(entity) {
    this.entities.push(entity);
    if (entity instanceof Creature) {
      this.creatures.push(entity);
    }
  }

  /**
   * Add civilization
   */
  addCivilization(civ) {
    this.civilizations.push(civ);
  }

  /**
   * Add building
   */
  addBuilding(building) {
    this.buildings.push(building);
  }

  /**
   * Get season name
   */
  getSeasonName() {
    const names = ['Spring', 'Summer', 'Fall', 'Winter'];
    return names[this.season];
  }

  /**
   * Get all entities in area
   */
  getEntitiesInArea(x, y, radius) {
    return this.entities.filter(e => 
      MathUtils.distance(e.x, e.y, x, y) <= radius
    );
  }

  /**
   * Get creatures in area
   */
  getCreaturesInArea(x, y, radius) {
    return this.creatures.filter(c => 
      MathUtils.distance(c.x, c.y, x, y) <= radius
    );
  }

  /**
   * Pause/Unpause simulation
   */
  setPaused(paused) {
    this.isPaused = paused;
  }

  /**
   * Set time speed
   */
  setTimeSpeed(speed) {
    this.timeSpeed = MathUtils.clamp(speed, 0, 4);
  }
}

/**
 * Tile class representing a single tile
 */
class Tile {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'grass'; // grass, water, sand, forest, mountain
    this.elevation = 0;
    this.moisture = 0.5;
    this.temperature = 15;
    this.humidity = 50;
    this.vegetation = null; // tree, bush, grass
    this.vegetationDensity = 0;
    this.hasRock = false;
    this.owner = null; // Civilization that owns this tile
    this.resources = {}; // gold, iron, wood, etc.
    this.pollution = 0;
  }

  /**
   * Get world coordinates
   */
  getWorldCoords() {
    return {
      x: this.x * this.size + this.size / 2,
      y: this.y * this.size + this.size / 2
    };
  }
}
