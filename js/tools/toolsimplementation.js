/**
 * Landscape Tool - Terrain editing
 */

class LandscapeTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'landscape';
    this.mode = 'raise'; // raise, lower, smooth, flatten
    this.terrainSystem = new TerrainSystem(world);
  }

  use(x, y, options) {
    this.radius = options.radius || this.radius;
    this.strength = options.strength || this.strength;
    const mode = options.mode || this.mode;

    switch (mode) {
      case 'raise':
        this.terrainSystem.raiseTerrain(x, y, this.radius, this.strength);
        break;
      case 'lower':
        this.terrainSystem.lowerTerrain(x, y, this.radius, this.strength);
        break;
      case 'smooth':
        this.terrainSystem.smoothTerrain(x, y, this.radius);
        break;
      case 'flatten':
        this.terrainSystem.smoothTerrain(x, y, this.radius);
        break;
    }
    return true;
  }

  getOptions() {
    return {
      radius: this.radius,
      strength: this.strength,
      mode: ['raise', 'lower', 'smooth', 'flatten']
    };
  }
}

/**
 * Water Tool - Add and manage water
 */

class WaterTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'water';
    this.terrainSystem = new TerrainSystem(world);
  }

  use(x, y, options) {
    this.radius = options.radius || this.radius;
    this.terrainSystem.addWater(x, y, this.radius, this.strength);
    return true;
  }
}

/**
 * Vegetation Tool - Place and remove vegetation
 */

class VegetationTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'vegetation';
    this.vegetationType = 'tree';
    this.terrainSystem = new TerrainSystem(world);
  }

  use(x, y, options) {
    this.radius = options.radius || this.radius;
    this.vegetationType = options.vegetationType || this.vegetationType;

    if (options.remove) {
      this.terrainSystem.removeVegetation(x, y, this.radius);
    } else {
      this.terrainSystem.addVegetation(x, y, this.radius, this.vegetationType);
    }
    return true;
  }

  getOptions() {
    return {
      radius: this.radius,
      strength: this.strength,
      vegetationType: ['tree', 'bush', 'grass']
    };
  }
}

/**
 * Creature Tool - Spawn creatures
 */

class CreatureTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'creature';
    this.creatureType = 'wolf';
  }

  use(x, y, options) {
    this.creatureType = options.creatureType || this.creatureType;
    const quantity = options.quantity || 1;

    for (let i = 0; i < quantity; i++) {
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;
      const creature = new Creature(x + offsetX, y + offsetY, this.creatureType);
      this.world.addEntity(creature);
    }
    return true;
  }

  getOptions() {
    return {
      creatureType: ['wolf', 'deer', 'bear', 'rabbit', 'eagle', 'fish', 'dragon'],
      quantity: 1
    };
  }
}

/**
 * Civilization Tool - Create civilizations
 */

class CivilizationTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'civilization';
  }

  use(x, y, options) {
    const name = options.name || `Civilization ${this.world.civilizations.length + 1}`;
    const color = options.color || '#' + Math.floor(Math.random() * 16777215).toString(16);
    
    const civ = new Civilization(name, x, y, color);
    
    // Add initial population
    for (let i = 0; i < 5; i++) {
      const human = new Human(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        `${name} Citizen ${i + 1}`
      );
      civ.addCitizen(human);
      this.world.addEntity(human);
    }
    
    // Add initial buildings
    const house = new Building(x, y, 'house');
    civ.addBuilding(house);
    this.world.addBuilding(house);
    
    this.world.addCivilization(civ);
    return true;
  }

  getOptions() {
    return {
      name: 'New Civilization',
      color: '#3498db'
    };
  }
}

/**
 * Magic Tool - Cast spells
 */

class MagicTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'magic';
    this.magicSystem = new MagicSystem();
    this.spell = 'fireball';
  }

  use(x, y, options) {
    this.spell = options.spell || this.spell;
    const spellResult = this.magicSystem.castSpell(
      { x: x - 50, y: y - 50 }, // Caster position
      this.spell,
      x,
      y,
      this.world
    );
    return spellResult.success;
  }

  getOptions() {
    return {
      spell: this.magicSystem.listSpells()
    };
  }
}

/**
 * Disaster Tool - Natural disasters
 */

class DisasterTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'disaster';
    this.disasterType = 'earthquake';
  }

  use(x, y, options) {
    this.radius = options.radius || this.radius;
    this.disasterType = options.disasterType || this.disasterType;

    switch (this.disasterType) {
      case 'earthquake':
        this.createEarthquake(x, y);
        break;
      case 'meteor':
        this.createMeteor(x, y);
        break;
      case 'tornado':
        this.createTornado(x, y);
        break;
      case 'flood':
        this.createFlood(x, y);
        break;
    }
    return true;
  }

  createEarthquake(x, y) {
    const radius = this.radius * 2;
    const entities = this.world.getEntitiesInArea(x, y, radius);
    
    for (const entity of entities) {
      entity.takeDamage(20);
      entity.vx += (Math.random() - 0.5) * 5;
      entity.vy += (Math.random() - 0.5) * 5;
    }
    
    // Damage buildings
    for (const building of this.world.buildings) {
      if (MathUtils.distance(building.x, building.y, x, y) < radius) {
        building.takeDamage(30);
      }
    }
  }

  createMeteor(x, y) {
    const radius = this.radius;
    const damage = 50;
    const entities = this.world.getEntitiesInArea(x, y, radius);
    
    for (const entity of entities) {
      entity.takeDamage(damage);
    }
  }

  createTornado(x, y) {
    const radius = this.radius * 1.5;
    const entities = this.world.getEntitiesInArea(x, y, radius);
    
    for (const entity of entities) {
      entity.takeDamage(15);
      const angle = MathUtils.angle(x, y, entity.x, entity.y);
      entity.vx = Math.cos(angle) * 5;
      entity.vy = Math.sin(angle) * 5;
    }
  }

  createFlood(x, y) {
    const terrainSystem = new TerrainSystem(this.world);
    terrainSystem.addWater(x, y, this.radius * 2, 10);
  }

  getOptions() {
    return {
      disasterType: ['earthquake', 'meteor', 'tornado', 'flood'],
      radius: this.radius
    };
  }
}

/**
 * Select Tool - Select and inspect entities
 */

class SelectTool extends Tool {
  constructor(world) {
    super(world);
    this.name = 'select';
    this.selectedEntity = null;
  }

  use(x, y, options) {
    this.radius = options.radius || 32;
    const entities = this.world.getEntitiesInArea(x, y, this.radius);
    
    if (entities.length > 0) {
      this.selectedEntity = entities[0];
      return entities[0];
    }
    
    return null;
  }

  getSelected() {
    return this.selectedEntity;
  }
}
