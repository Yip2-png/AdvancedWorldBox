/**
 * Main Game Class - Core game loop and initialization
 * Orchestrates all game systems
 */

class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.running = false;
    this.paused = false;
    this.lastFrameTime = Date.now();
    this.deltaTime = 0;

    // Initialize game systems
    this.world = null;
    this.renderer = null;
    this.inputManager = null;
    this.toolManager = null;
    this.ui = null;
    this.combatSystem = null;
    this.economySystem = null;
    this.aiSystem = null;

    this.initialize();
  }

  /**
   * Initialize all game systems
   */
  initialize() {
    console.log('Initializing WorldBox Game...');

    // Create world
    this.world = new World(
      this.canvas.width,
      this.canvas.height,
      32 // Tile size
    );
    console.log('✓ World created');

    // Create renderer
    this.renderer = new Renderer(this.canvas, this.world);
    console.log('✓ Renderer initialized');

    // Create input manager
    this.inputManager = new InputManager(this.canvas, this);
    console.log('✓ Input manager initialized');

    // Create tool manager
    this.toolManager = new ToolManager(this.world);
    this.toolManager.selectTool('landscape');
    console.log('✓ Tool manager initialized');

    // Create UI manager
    this.ui = new UIManager(this);
    console.log('✓ UI manager initialized');

    // Create combat system
    this.combatSystem = new CombatSystem();
    console.log('✓ Combat system initialized');

    // Create economy system
    this.economySystem = new EconomySystem();
    console.log('✓ Economy system initialized');

    // Create AI system
    this.aiSystem = new AISystem(this.world);
    console.log('✓ AI system initialized');

    // Add initial content
    this.addInitialContent();
    console.log('✓ Initial content added');

    // Start game loop
    this.running = true;
    this.gameLoop();
    console.log('✓ Game loop started');
  }

  /**
   * Add initial game content
   */
  addInitialContent() {
    // Add some creatures
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * this.world.width;
      const y = Math.random() * this.world.height;
      const types = ['wolf', 'deer', 'bear', 'rabbit', 'eagle'];
      const creature = new Creature(x, y, types[Math.floor(Math.random() * types.length)]);
      this.world.addEntity(creature);
    }

    // Add a civilization
    const civX = this.world.width * 0.5;
    const civY = this.world.height * 0.5;
    const civ = new Civilization('Starting Civilization', civX, civY, '#3498db');

    for (let i = 0; i < 10; i++) {
      const human = new Human(
        civX + (Math.random() - 0.5) * 50,
        civY + (Math.random() - 0.5) * 50,
        `Citizen ${i + 1}`
      );
      civ.addCitizen(human);
      this.world.addEntity(human);
    }

    // Add buildings
    const townhall = new Building(civX, civY, 'house');
    civ.addBuilding(townhall);
    this.world.addBuilding(townhall);

    const farm = new Building(civX + 50, civY, 'farm');
    civ.addBuilding(farm);
    this.world.addBuilding(farm);

    this.world.addCivilization(civ);
  }

  /**
   * Main game loop
   */
  gameLoop = () => {
    const now = Date.now();
    this.deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Update
    this.update();

    // Render
    this.render();

    // Continue loop
    requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game state
   */
  update() {
    if (this.world.isPaused) return;

    // Update world
    this.world.update();

    // Update combat
    this.combatSystem.updateConflicts(this.world);

    // Update economy
    this.economySystem.update(this.world.civilizations);

    // Update renderer
    this.renderer.update();

    // Update camera
    if (this.world.civilizations.length > 0) {
      const civ = this.world.civilizations[0];
      if (civ.population.length > 0) {
        const citizen = civ.population[0];
        this.renderer.updateCamera(citizen.x, citizen.y);
      }
    }

    // Update UI
    this.ui.updateStatsDisplay();
  }

  /**
   * Render game
   */
  render() {
    // Clear and render world
    this.renderer.render();

    // Draw tool cursor
    this.drawToolCursor();
  }

  /**
   * Draw tool cursor/preview
   */
  drawToolCursor() {
    const tool = this.toolManager.getCurrentTool();
    if (tool) {
      const screenPos = this.canvas.getBoundingClientRect();
      const x = this.inputManager.mouseX;
      const y = this.inputManager.mouseY;

      this.ctx.save();
      this.ctx.strokeStyle = '#FFFF00';
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, tool.radius * this.renderer.zoom, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  /**
   * Get game state
   */
  getState() {
    return {
      year: this.world.year,
      season: this.world.getSeasonName(),
      population: this.world.stats.totalPopulation,
      civilizations: this.world.civilizations.length,
      creatures: this.world.creatures.length,
      buildings: this.world.buildings.length,
      paused: this.world.isPaused,
      timeSpeed: this.world.timeSpeed
    };
  }

  /**
   * Save game
   */
  saveGame(name) {
    const gameData = {
      name: name,
      timestamp: Date.now(),
      state: this.getState(),
      world: {
        year: this.world.year,
        season: this.world.season,
        population: this.world.stats.totalPopulation
      }
    };
    localStorage.setItem(`worldbox_save_${name}`, JSON.stringify(gameData));
    this.ui.showNotification(`Game saved: ${name}`, 'success');
  }

  /**
   * Load game
   */
  loadGame(name) {
    const data = localStorage.getItem(`worldbox_save_${name}`);
    if (data) {
      const gameData = JSON.parse(data);
      this.ui.showNotification(`Game loaded: ${name}`, 'success');
      return gameData;
    }
    return null;
  }

  /**
   * Toggle pause
   */
  togglePause() {
    this.world.isPaused = !this.world.isPaused;
  }
}

// Global game instance
let game;

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  game = new Game('gameCanvas');
  console.log('🎮 WorldBox Game Ready!');
});
