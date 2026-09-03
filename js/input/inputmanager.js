/**
 * Input Manager - Handle all user input
 * Keyboard, mouse, and touch events
 */

class InputManager {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mousePressed = false;
    this.mouseButton = 0;
    this.touches = [];
    this.rightClickMenu = null;
    
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));
    this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Handle key down
   */
  handleKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;

    // Keyboard shortcuts
    if (e.key === ' ') {
      e.preventDefault();
      this.game.ui.togglePause();
    }
    if (e.key === '+' || e.key === '=') {
      this.game.renderer.setZoom(this.game.renderer.zoom + 0.2);
    }
    if (e.key === '-') {
      this.game.renderer.setZoom(this.game.renderer.zoom - 0.2);
    }
    if (e.key === '0') {
      this.game.renderer.zoom = 1;
    }
    if (e.key === 'g') {
      this.game.renderer.showGrid = !this.game.renderer.showGrid;
    }
    if (e.key === 'c') {
      this.game.renderer.showColliders = !this.game.renderer.showColliders;
    }
    if (e.key === 'Escape') {
      this.closeContextMenu();
    }
  }

  /**
   * Handle key up
   */
  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  /**
   * Check if key is pressed
   */
  isKeyPressed(key) {
    return this.keys[key.toLowerCase()] === true;
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    this.mousePressed = true;
    this.mouseButton = e.button;

    const worldPos = this.game.renderer.screenToWorld(this.mouseX, this.mouseY);

    if (e.button === 0) { // Left click
      this.game.toolManager.useTool(worldPos.x, worldPos.y);
    }
  }

  /**
   * Handle mouse up
   */
  handleMouseUp(e) {
    this.mousePressed = false;
  }

  /**
   * Handle mouse wheel
   */
  handleMouseWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    this.game.renderer.setZoom(this.game.renderer.zoom + direction * zoomSpeed);
  }

  /**
   * Handle right click context menu
   */
  handleContextMenu(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.showContextMenu(x, y);
  }

  /**
   * Show context menu
   */
  showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu') || this.createContextMenu();
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
    this.rightClickMenu = menu;
  }

  /**
   * Create context menu
   */
  createContextMenu() {
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.className = 'context-menu hidden';
    menu.innerHTML = `
      <div class="context-menu-item" onclick="game.ui.showStatsModal()">Statistics</div>
      <div class="context-menu-item" onclick="game.ui.showSettingsModal()">Settings</div>
      <div class="context-menu-item" onclick="game.ui.togglePause()">Toggle Pause</div>
    `;
    document.body.appendChild(menu);
    return menu;
  }

  /**
   * Close context menu
   */
  closeContextMenu() {
    if (this.rightClickMenu) {
      this.rightClickMenu.classList.add('hidden');
    }
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    this.touches = Array.from(e.touches);
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (this.touches.length === 2) {
      const touch1 = this.touches[0];
      const touch2 = e.touches[1];
      const distance1 = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const distance2 = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance2 / distance1;
      this.game.renderer.setZoom(this.game.renderer.zoom * scale);
    }
    this.touches = Array.from(e.touches);
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    this.touches = Array.from(e.touches);
  }

  /**
   * Get mouse position in world coordinates
   */
  getWorldMousePosition() {
    return this.game.renderer.screenToWorld(this.mouseX, this.mouseY);
  }
}
