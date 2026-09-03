/**
 * Tool Manager - Game creation tools system
 * Manages all player interaction tools
 */

class ToolManager {
  constructor(world) {
    this.world = world;
    this.currentTool = null;
    this.tools = new Map();
    this.toolOptions = {};
    this.initializeTools();
  }

  /**
   * Initialize all tools
   */
  initializeTools() {
    this.registerTool('landscape', new LandscapeTool(this.world));
    this.registerTool('water', new WaterTool(this.world));
    this.registerTool('vegetation', new VegetationTool(this.world));
    this.registerTool('creature', new CreatureTool(this.world));
    this.registerTool('civilization', new CivilizationTool(this.world));
    this.registerTool('magic', new MagicTool(this.world));
    this.registerTool('disaster', new DisasterTool(this.world));
    this.registerTool('select', new SelectTool(this.world));
  }

  /**
   * Register tool
   */
  registerTool(name, tool) {
    this.tools.set(name, tool);
  }

  /**
   * Select tool
   */
  selectTool(name) {
    if (this.tools.has(name)) {
      this.currentTool = name;
      return this.tools.get(name);
    }
    return null;
  }

  /**
   * Get current tool
   */
  getCurrentTool() {
    return this.currentTool ? this.tools.get(this.currentTool) : null;
  }

  /**
   * Use tool at position
   */
  useTool(x, y, options = {}) {
    const tool = this.getCurrentTool();
    if (tool) {
      return tool.use(x, y, { ...this.toolOptions, ...options });
    }
    return false;
  }

  /**
   * Set tool option
   */
  setToolOption(key, value) {
    this.toolOptions[key] = value;
  }

  /**
   * Get tool options
   */
  getToolOptions() {
    const tool = this.getCurrentTool();
    if (tool) {
      return tool.getOptions();
    }
    return {};
  }
}

/**
 * Base Tool Class
 */
class Tool {
  constructor(world) {
    this.world = world;
    this.name = 'tool';
    this.radius = 32;
    this.strength = 1;
    this.options = {};
  }

  /**
   * Use tool
   */
  use(x, y, options) {
    throw new Error('Tool.use() must be implemented');
  }

  /**
   * Get tool options
   */
  getOptions() {
    return {
      radius: this.radius,
      strength: this.strength,
      ...this.options
    };
  }

  /**
   * Set radius
   */
  setRadius(radius) {
    this.radius = MathUtils.clamp(radius, 5, 200);
  }

  /**
   * Set strength
   */
  setStrength(strength) {
    this.strength = MathUtils.clamp(strength, 0.1, 5);
  }
}
