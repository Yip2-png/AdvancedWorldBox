/**
 * Magic System - Spells, magic, and supernatural elements
 * Advanced magic mechanics and spell effects
 */

class MagicSystem {
  constructor() {
    this.spells = new Map();
    this.magicalEffects = [];
    this.initializeSpells();
  }

  /**
   * Initialize spell list
   */
  initializeSpells() {
    this.registerSpell('fireball', {
      name: 'Fireball',
      manaCost: 50,
      cooldown: 30,
      range: 200,
      damage: 30,
      radius: 50,
      color: '#FF6600'
    });
    
    this.registerSpell('frostbolt', {
      name: 'Frostbolt',
      manaCost: 40,
      cooldown: 20,
      range: 250,
      damage: 25,
      slowEffect: 0.5,
      color: '#00CCFF'
    });
    
    this.registerSpell('heal', {
      name: 'Heal',
      manaCost: 30,
      cooldown: 15,
      range: 100,
      healing: 40,
      color: '#00FF00'
    });
    
    this.registerSpell('lightning', {
      name: 'Lightning',
      manaCost: 60,
      cooldown: 45,
      range: 300,
      damage: 40,
      color: '#FFFF00'
    });
    
    this.registerSpell('earthquake', {
      name: 'Earthquake',
      manaCost: 100,
      cooldown: 60,
      range: 150,
      damage: 50,
      radius: 200,
      color: '#8B4513'
    });
  }

  /**
   * Register spell
   */
  registerSpell(name, properties) {
    this.spells.set(name, {
      ...properties,
      lastCasted: -Infinity
    });
  }

  /**
   * Cast spell
   */
  castSpell(caster, spellName, targetX, targetY, world) {
    const spell = this.spells.get(spellName);
    if (!spell) return null;

    // Check cooldown
    const timeSinceLast = world.year * 10000 + world.dayOfSeason - spell.lastCasted;
    if (timeSinceLast < spell.cooldown) {
      return { success: false, reason: 'Spell on cooldown' };
    }

    // Check range
    const distance = MathUtils.distance(caster.x, caster.y, targetX, targetY);
    if (distance > spell.range) {
      return { success: false, reason: 'Out of range' };
    }

    // Execute spell
    this.executeSpell(spell, caster, targetX, targetY, world);
    spell.lastCasted = world.year * 10000 + world.dayOfSeason;

    return { success: true, spell: spellName };
  }

  /**
   * Execute spell
   */
  executeSpell(spell, caster, x, y, world) {
    const affectedEntities = world.getEntitiesInArea(x, y, spell.range || 100);

    switch (spell.name) {
      case 'Fireball':
        this.castFireball(spell, x, y, affectedEntities);
        break;
      case 'Frostbolt':
        this.castFrostbolt(spell, x, y, affectedEntities);
        break;
      case 'Heal':
        this.castHeal(spell, caster, affectedEntities);
        break;
      case 'Lightning':
        this.castLightning(spell, x, y, affectedEntities);
        break;
      case 'Earthquake':
        this.castEarthquake(spell, x, y, world);
        break;
    }
  }

  /**
   * Fireball spell
   */
  castFireball(spell, x, y, entities) {
    for (const entity of entities) {
      entity.takeDamage(spell.damage);
      entity.addStatusEffect(new StatusEffect('burning', 30, { damagePerTurn: 2 }));
    }
  }

  /**
   * Frostbolt spell
   */
  castFrostbolt(spell, x, y, entities) {
    for (const entity of entities) {
      entity.takeDamage(spell.damage);
      entity.addStatusEffect(new StatusEffect('slowed', 40, { speedMultiplier: spell.slowEffect }));
    }
  }

  /**
   * Heal spell
   */
  castHeal(spell, caster, entities) {
    for (const entity of entities) {
      if (entity.health > 0) {
        entity.heal(spell.healing);
      }
    }
  }

  /**
   * Lightning spell
   */
  castLightning(spell, x, y, entities) {
    // Chain lightning effect
    for (const entity of entities) {
      entity.takeDamage(spell.damage);
      entity.addStatusEffect(new StatusEffect('stunned', 15));
    }
  }

  /**
   * Earthquake spell
   */
  castEarthquake(spell, x, y, world) {
    const affectedTiles = [];
    const tileRadius = Math.ceil(spell.radius / world.tileSize);
    const centerTileX = Math.floor(x / world.tileSize);
    const centerTileY = Math.floor(y / world.tileSize);
    
    for (let dy = -tileRadius; dy <= tileRadius; dy++) {
      for (let dx = -tileRadius; dx <= tileRadius; dx++) {
        const tx = centerTileX + dx;
        const ty = centerTileY + dy;
        
        if (ty >= 0 && ty < world.tiles.length && 
            tx >= 0 && tx < world.tiles[0].length) {
          const tile = world.tiles[ty][tx];
          const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
          
          if (dist <= spell.radius) {
            tile.elevation -= 5;
            affectedTiles.push(tile);
          }
        }
      }
    }
    
    // Damage entities
    const entities = world.getEntitiesInArea(x, y, spell.radius);
    for (const entity of entities) {
      entity.takeDamage(spell.damage);
    }
  }

  /**
   * Get spell info
   */
  getSpellInfo(spellName) {
    return this.spells.get(spellName);
  }

  /**
   * List all available spells
   */
  listSpells() {
    return Array.from(this.spells.keys());
  }
}
