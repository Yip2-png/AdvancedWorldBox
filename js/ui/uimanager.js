/**
 * UI Manager - User interface management
 * Handles UI updates and interactions
 */

class UIManager {
  constructor(game) {
    this.game = game;
    this.selectedEntity = null;
    this.showStats = false;
    this.notificationQueue = [];
    this.initializeEventListeners();
  }

  /**
   * Initialize UI event listeners
   */
  initializeEventListeners() {
    // Menu buttons
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('speedBtn').addEventListener('click', () => this.cycleSpeed());
    document.getElementById('statsBtn').addEventListener('click', () => this.showStatsModal());
    document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectTool(e.target.closest('.tool-btn')));
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });
  }

  /**
   * Toggle pause
   */
  togglePause() {
    this.game.world.isPaused = !this.game.world.isPaused;
    const btn = document.getElementById('pauseBtn');
    btn.classList.toggle('active', this.game.world.isPaused);
  }

  /**
   * Cycle game speed
   */
  cycleSpeed() {
    const speeds = [1, 2, 4, 8];
    const currentIndex = speeds.indexOf(this.game.world.timeSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    this.game.world.setTimeSpeed(speeds[nextIndex]);
    this.updateSpeedDisplay();
  }

  /**
   * Update speed display
   */
  updateSpeedDisplay() {
    const speedText = document.getElementById('speedText');
    const speedStat = document.getElementById('speedStat');
    speedText.textContent = `${this.game.world.timeSpeed}x`;
    speedStat.textContent = this.game.world.timeSpeed === 1 ? 'Normal' : `${this.game.world.timeSpeed}x`;
  }

  /**
   * Select tool
   */
  selectTool(btn) {
    // Remove previous active state
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const toolName = btn.dataset.tool;
    const tool = this.game.toolManager.selectTool(toolName);
    
    if (tool) {
      this.updateToolOptions(tool);
    }
  }

  /**
   * Update tool options panel
   */
  updateToolOptions(tool) {
    const toolSettings = document.getElementById('toolSettings');
    const toolTitle = document.getElementById('toolTitle');
    toolTitle.textContent = tool.name.charAt(0).toUpperCase() + tool.name.slice(1) + ' Options';
    toolSettings.innerHTML = '';

    const options = tool.getOptions();
    
    for (const [key, value] of Object.entries(options)) {
      if (Array.isArray(value)) {
        // Select dropdown
        const group = document.createElement('div');
        group.className = 'tool-option';
        group.innerHTML = `
          <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <select>
            ${value.map(v => `<option>${v}</option>`).join('')}
          </select>
        `;
        group.querySelector('select').addEventListener('change', (e) => {
          this.game.toolManager.setToolOption(key, e.target.value);
        });
        toolSettings.appendChild(group);
      } else if (typeof value === 'number') {
        // Range slider
        const group = document.createElement('div');
        group.className = 'tool-option';
        const min = key === 'radius' ? 5 : 0.1;
        const max = key === 'radius' ? 200 : 5;
        group.innerHTML = `
          <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <input type="range" min="${min}" max="${max}" step="0.1" value="${value}">
        `;
        group.querySelector('input').addEventListener('change', (e) => {
          this.game.toolManager.setToolOption(key, parseFloat(e.target.value));
        });
        toolSettings.appendChild(group);
      }
    }
  }

  /**
   * Show statistics modal
   */
  showStatsModal() {
    const modal = document.getElementById('statsModal');
    const body = document.getElementById('statsModalBody');
    
    const stats = {
      'Year': this.game.world.year,
      'Season': this.game.world.getSeasonName(),
      'Temperature': Math.floor(this.game.world.temperature) + '°C',
      'Total Population': this.game.world.stats.totalPopulation,
      'Civilizations': this.game.world.civilizations.length,
      'Creatures': this.game.world.creatures.length,
      'Buildings': this.game.world.buildings.length,
      'Deaths': this.game.world.stats.totalDeaths,
      'Weather': this.game.world.weather.getWeatherName()
    };

    body.innerHTML = Object.entries(stats)
      .map(([key, value]) => `<div class="info-item"><div class="info-label">${key}</div><div class="info-value">${value}</div></div>`)
      .join('');
    
    modal.classList.remove('hidden');
  }

  /**
   * Show settings modal
   */
  showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    
    document.getElementById('graphicsQuality').addEventListener('change', (e) => {
      this.game.renderer.graphicsQuality = e.target.value;
    });
    
    document.getElementById('volumeSlider').addEventListener('change', (e) => {
      soundManager.setMasterVolume(e.target.value / 100);
    });
  }

  /**
   * Close modal
   */
  closeModal(modal) {
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('remove');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Update stats display
   */
  updateStatsDisplay() {
    document.getElementById('yearDisplay').textContent = this.game.world.year;
    document.getElementById('seasonDisplay').textContent = this.game.world.getSeasonName();
    document.getElementById('popStat').textContent = this.game.world.stats.totalPopulation;
    document.getElementById('civStat').textContent = this.game.world.civilizations.length;
    document.getElementById('creatureStat').textContent = this.game.world.creatures.length;
    document.getElementById('tempStat').textContent = Math.floor(this.game.world.temperature) + '°C';
  }

  /**
   * Update info panel
   */
  updateInfoPanel(entity) {
    const infoContent = document.getElementById('infoContent');
    
    if (!entity) {
      infoContent.innerHTML = '<p>Click on entities to inspect them</p>';
      return;
    }

    let html = '<div class="info-item">';
    
    if (entity instanceof Human) {
      const info = entity.getInfo();
      html += `<div class="info-label">Human</div>`;
      html += `<div class="info-value">${info.name}</div>`;
      html += `<div class="info-item"><div class="info-label">Age</div><div class="info-value">${info.age}</div></div>`;
      html += `<div class="info-item"><div class="info-label">Job</div><div class="info-value">${info.job}</div></div>`;
      html += `<div class="info-item"><div class="info-label">Health</div><div class="info-value">${info.health}</div></div>`;
      html += `<div class="info-item"><div class="info-label">Happiness</div><div class="info-value">${info.happiness}</div></div>`;
    } else if (entity instanceof Creature) {
      html += `<div class="info-label">Creature</div>`;
      html += `<div class="info-value">${entity.species}</div>`;
      html += `<div class="info-item"><div class="info-label">Health</div><div class="info-value">${Math.floor(entity.health)}</div></div>`;
      html += `<div class="info-item"><div class="info-label">Age</div><div class="info-value">${Math.floor(entity.age)}</div></div>`;
    } else if (entity instanceof Building) {
      html += `<div class="info-label">Building</div>`;
      html += `<div class="info-value">${entity.type}</div>`;
      html += `<div class="info-item"><div class="info-label">Health</div><div class="info-value">${Math.floor(entity.health)}</div></div>`;
    }
    
    html += '</div>';
    infoContent.innerHTML = html;
  }
}
