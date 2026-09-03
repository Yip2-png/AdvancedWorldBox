/**
 * Terrain System - Advanced terrain manipulation
 * Handles terrain editing, erosion, and features
 */

class TerrainSystem {
  constructor(world) {
    this.world = world;
    this.erosionStrength = 0.5;
    this.smoothingStrength = 0.3;
  }

  /**
   * Raise terrain in area
   */
  raiseTerrain(x, y, radius, amount) {
    const tilesAffected = this.getAffectedTiles(x, y, radius);
    
    for (const tile of tilesAffected) {
      const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
      const influence = 1 - (dist / radius);
      tile.elevation += amount * influence;
    }
    
    this.updateTerrain();
  }

  /**
   * Lower terrain in area
   */
  lowerTerrain(x, y, radius, amount) {
    this.raiseTerrain(x, y, radius, -amount);
  }

  /**
   * Smooth terrain in area
   */
  smoothTerrain(x, y, radius) {
    const tilesAffected = this.getAffectedTiles(x, y, radius);
    const avgElevation = tilesAffected.reduce((sum, t) => sum + t.elevation, 0) / tilesAffected.length;
    
    for (const tile of tilesAffected) {
      const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
      const influence = 1 - (dist / radius);
      tile.elevation = MathUtils.lerp(tile.elevation, avgElevation, influence * this.smoothingStrength);
    }
    
    this.updateTerrain();
  }

  /**
   * Add water in area
   */
  addWater(x, y, radius, depth = 5) {
    const tilesAffected = this.getAffectedTiles(x, y, radius);
    
    for (const tile of tilesAffected) {
      const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
      const influence = 1 - (dist / radius);
      
      if (tile.type !== 'mountain') {
        tile.type = 'water';
        tile.elevation = -depth * influence;
      }
    }
  }

  /**
   * Add vegetation
   */
  addVegetation(x, y, radius, type = 'tree') {
    const tilesAffected = this.getAffectedTiles(x, y, radius);
    
    for (const tile of tilesAffected) {
      const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
      const influence = 1 - (dist / radius);
      
      if (tile.type === 'grass' || tile.type === 'forest') {
        tile.vegetation = type;
        tile.vegetationDensity = Math.min(1, tile.vegetationDensity + influence * 0.5);
        if (tile.type === 'grass') {
          tile.type = 'forest';
        }
      }
    }
  }

  /**
   * Remove vegetation
   */
  removeVegetation(x, y, radius) {
    const tilesAffected = this.getAffectedTiles(x, y, radius);
    
    for (const tile of tilesAffected) {
      tile.vegetation = null;
      tile.vegetationDensity = 0;
      if (tile.type === 'forest') {
        tile.type = 'grass';
      }
    }
  }

  /**
   * Apply erosion
   */
  applyErosion(x, y, radius) {
    const tilesAffected = this.getAffectedTiles(x, y, radius);
    
    for (const tile of tilesAffected) {
      const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
      const influence = (1 - (dist / radius)) * this.erosionStrength;
      
      // Lower elevation
      tile.elevation = Math.max(-20, tile.elevation - influence * 5);
      
      // Become sand or water
      if (tile.elevation < -5) {
        tile.type = 'water';
      } else if (tile.elevation < 0) {
        tile.type = 'sand';
      }
    }
  }

  /**
   * Create cave system
   */
  createCaveSystem(x, y, size = 10) {
    const tilesAffected = this.getAffectedTiles(x, y, size);
    
    for (const tile of tilesAffected) {
      if (tile.type === 'mountain') {
        tile.type = 'cave';
        tile.elevation -= 10;
      }
    }
  }

  /**
   * Get affected tiles
   */
  getAffectedTiles(x, y, radius) {
    const affected = [];
    const tileRadius = Math.ceil(radius / this.world.tileSize);
    const centerTileX = Math.floor(x / this.world.tileSize);
    const centerTileY = Math.floor(y / this.world.tileSize);
    
    for (let dy = -tileRadius; dy <= tileRadius; dy++) {
      for (let dx = -tileRadius; dx <= tileRadius; dx++) {
        const tx = centerTileX + dx;
        const ty = centerTileY + dy;
        
        if (ty >= 0 && ty < this.world.tiles.length && 
            tx >= 0 && tx < this.world.tiles[0].length) {
          const tile = this.world.tiles[ty][tx];
          const dist = MathUtils.distance(x, y, tile.x * tile.size, tile.y * tile.size);
          
          if (dist <= radius) {
            affected.push(tile);
          }
        }
      }
    }
    
    return affected;
  }

  /**
   * Update terrain types based on elevation
   */
  updateTerrain() {
    for (let row of this.world.tiles) {
      for (let tile of row) {
        if (tile.type !== 'water' && tile.type !== 'mountain') {
          if (tile.elevation < -5) {
            tile.type = 'water';
          } else if (tile.elevation < 0) {
            tile.type = 'sand';
          } else if (tile.elevation < 30) {
            tile.type = 'grass';
          } else {
            tile.type = 'mountain';
          }
        }
      }
    }
  }
}
