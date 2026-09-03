/**
 * Renderer - Advanced 2D rendering system
 * Handles all visual rendering with optimizations
 */

class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.width = canvas.width;
    this.height = canvas.height;
    this.cameraX = 0;
    this.cameraY = 0;
    this.zoom = 1;
    this.fps = 60;
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.particleSystem = new ParticleSystem();
    this.graphicsQuality = 'medium';
    this.showGrid = false;
    this.showColliders = false;
    this.visibleEntities = [];
    this.chunkSize = 256;
    this.shader = new ShaderSystem();
  }

  /**
   * Update camera position
   */
  updateCamera(targetX, targetY) {
    const targetCameraX = targetX - this.width / 2 / this.zoom;
    const targetCameraY = targetY - this.height / 2 / this.zoom;
    
    // Smooth camera movement
    this.cameraX += (targetCameraX - this.cameraX) * 0.1;
    this.cameraY += (targetCameraY - this.cameraY) * 0.1;
  }

  /**
   * Set zoom level
   */
  setZoom(zoom) {
    this.zoom = MathUtils.clamp(zoom, 0.5, 3);
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(x, y) {
    return {
      x: (x - this.cameraX) * this.zoom,
      y: (y - this.cameraY) * this.zoom
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(x, y) {
    return {
      x: x / this.zoom + this.cameraX,
      y: y / this.zoom + this.cameraY
    };
  }

  /**
   * Render the entire scene
   */
  render() {
    // Clear canvas
    this.clearCanvas();

    // Setup rendering context
    this.ctx.save();
    this.ctx.translate(-this.cameraX * this.zoom, -this.cameraY * this.zoom);
    this.ctx.scale(this.zoom, this.zoom);

    // Render layers
    this.renderTerrain();
    this.renderVegetation();
    this.renderBuildings();
    this.renderCreatures();
    this.renderHumans();
    this.renderProjectiles();
    this.renderParticles();

    // Render overlays
    if (this.showGrid) {
      this.renderGrid();
    }
    if (this.showColliders) {
      this.renderColliders();
    }

    this.ctx.restore();

    // Render UI overlay
    this.renderUIOverlay();

    // Update FPS
    this.updateFPS();
  }

  /**
   * Clear canvas
   */
  clearCanvas() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Gradient sky
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#E0F6FF');
    gradient.addColorStop(1, '#90EE90');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Render terrain tiles
   */
  renderTerrain() {
    const startTileX = Math.floor(this.cameraX / this.world.tileSize);
    const startTileY = Math.floor(this.cameraY / this.world.tileSize);
    const endTileX = startTileX + Math.ceil(this.width / this.world.tileSize / this.zoom) + 1;
    const endTileY = startTileY + Math.ceil(this.height / this.world.tileSize / this.zoom) + 1;

    for (let y = Math.max(0, startTileY); y < Math.min(this.world.tiles.length, endTileY); y++) {
      for (let x = Math.max(0, startTileX); x < Math.min(this.world.tiles[y].length, endTileX); x++) {
        const tile = this.world.tiles[y][x];
        this.renderTile(tile);
      }
    }
  }

  /**
   * Render single tile
   */
  renderTile(tile) {
    const x = tile.x * tile.size;
    const y = tile.y * tile.size;
    const size = tile.size;

    // Draw base terrain
    let color = this.getTileColor(tile);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);

    // Add elevation shading
    const elevationShade = (tile.elevation / 100) * 30;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, elevationShade) / 255})`;
    this.ctx.fillRect(x, y, size, size);

    // Tile border
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeRect(x, y, size, size);

    // Pollution overlay
    if (tile.pollution > 0) {
      this.ctx.fillStyle = `rgba(139, 69, 19, ${tile.pollution / 100})`;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  /**
   * Get tile color based on type
   */
  getTileColor(tile) {
    const colors = {
      'water': '#1E90FF',
      'sand': '#F4A460',
      'grass': '#228B22',
      'forest': '#006400',
      'mountain': '#8B7355',
      'cave': '#2F4F4F'
    };
    return colors[tile.type] || '#808080';
  }

  /**
   * Render vegetation
   */
  renderVegetation() {
    const startTileX = Math.floor(this.cameraX / this.world.tileSize);
    const startTileY = Math.floor(this.cameraY / this.world.tileSize);
    const endTileX = startTileX + Math.ceil(this.width / this.world.tileSize / this.zoom) + 1;
    const endTileY = startTileY + Math.ceil(this.height / this.world.tileSize / this.zoom) + 1;

    for (let y = Math.max(0, startTileY); y < Math.min(this.world.tiles.length, endTileY); y++) {
      for (let x = Math.max(0, startTileX); x < Math.min(this.world.tiles[y].length, endTileX); x++) {
        const tile = this.world.tiles[y][x];
        if (tile.vegetation && tile.vegetationDensity > 0) {
          this.renderVegetationTile(tile);
        }
      }
    }
  }

  /**
   * Render vegetation on tile
   */
  renderVegetationTile(tile) {
    const x = tile.x * tile.size + tile.size / 2;
    const y = tile.y * tile.size + tile.size / 2;
    const density = Math.floor(tile.vegetationDensity * 8);

    for (let i = 0; i < density; i++) {
      const offsetX = (Math.sin(x * 0.1 + i) * tile.size * 0.3);
      const offsetY = (Math.cos(y * 0.1 + i) * tile.size * 0.3);
      const treeX = x + offsetX;
      const treeY = y + offsetY;

      this.renderTree(treeX, treeY, 4);
    }
  }

  /**
   * Render tree
   */
  renderTree(x, y, size) {
    // Trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x - 2, y, 4, size);

    // Foliage
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 2, size * 1.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Render buildings
   */
  renderBuildings() {
    for (const building of this.world.buildings) {
      building.draw(this.ctx);
    }
  }

  /**
   * Render creatures
   */
  renderCreatures() {
    for (const creature of this.world.creatures) {
      creature.draw(this.ctx);
    }
  }

  /**
   * Render humans
   */
  renderHumans() {
    for (const entity of this.world.entities) {
      if (entity instanceof Human) {
        entity.draw(this.ctx);
      }
    }
  }

  /**
   * Render projectiles
   */
  renderProjectiles() {
    for (const projectile of this.world.projectiles) {
      projectile.draw(this.ctx);
    }
  }

  /**
   * Render particles
   */
  renderParticles() {
    this.particleSystem.draw(this.ctx);
  }

  /**
   * Render grid (debug)
   */
  renderGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;

    const startTileX = Math.floor(this.cameraX / this.world.tileSize);
    const startTileY = Math.floor(this.cameraY / this.world.tileSize);
    const endTileX = startTileX + Math.ceil(this.width / this.world.tileSize / this.zoom) + 1;
    const endTileY = startTileY + Math.ceil(this.height / this.world.tileSize / this.zoom) + 1;

    for (let x = startTileX; x <= endTileX; x++) {
      const screenX = x * this.world.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, startTileY * this.world.tileSize);
      this.ctx.lineTo(screenX, endTileY * this.world.tileSize);
      this.ctx.stroke();
    }

    for (let y = startTileY; y <= endTileY; y++) {
      const screenY = y * this.world.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(startTileX * this.world.tileSize, screenY);
      this.ctx.lineTo(endTileX * this.world.tileSize, screenY);
      this.ctx.stroke();
    }
  }

  /**
   * Render colliders (debug)
   */
  renderColliders() {
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 1;

    for (const entity of this.world.entities) {
      const bounds = entity.getBounds();
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }

  /**
   * Render UI overlay
   */
  renderUIOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    this.ctx.fillText(`Zoom: ${this.zoom.toFixed(2)}x`, 10, 35);
    this.ctx.fillText(`Entities: ${this.world.entities.length}`, 10, 50);
    this.ctx.fillText(`Creatures: ${this.world.creatures.length}`, 10, 65);
    this.ctx.fillText(`Buildings: ${this.world.buildings.length}`, 10, 80);
    this.ctx.restore();
  }

  /**
   * Update FPS counter
   */
  updateFPS() {
    this.frameCount++;
    const now = Date.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed > 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  /**
   * Create particle effect
   */
  createParticles(x, y, count, options) {
    this.particleSystem.emit(x, y, count, options);
  }

  /**
   * Update renderer
   */
  update() {
    this.particleSystem.update();
  }
}
