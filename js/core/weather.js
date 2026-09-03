/**
 * Weather System - Dynamic weather and climate
 * Handles rain, storms, temperature, etc.
 */

class Weather {
  constructor() {
    this.type = 'clear'; // clear, cloudy, rainy, stormy, snowy
    this.intensity = 0; // 0-1
    this.duration = 0;
    this.maxDuration = 100;
    this.windSpeed = 0;
    this.windDirection = 0;
    this.humidity = 50;
    this.pressure = 1013; // hPa
    this.visibility = 1; // 0-1
    this.cloudCover = 0; // 0-1
    this.rainAmount = 0;
    this.temperature = 15;
  }

  /**
   * Update weather
   */
  update() {
    this.duration++;
    
    // Change weather randomly
    if (this.duration >= this.maxDuration || Math.random() < 0.01) {
      this.changeWeather();
    }
    
    // Update wind
    this.windSpeed += (Math.random() - 0.5) * 0.5;
    this.windSpeed = MathUtils.clamp(this.windSpeed, 0, 20);
    this.windDirection += (Math.random() - 0.5) * 5;
    
    // Update visibility
    if (this.type === 'rainy' || this.type === 'stormy') {
      this.visibility = Math.max(0.3, this.visibility - 0.02);
    } else if (this.type === 'snowy') {
      this.visibility = Math.max(0.2, this.visibility - 0.03);
    } else {
      this.visibility = Math.min(1, this.visibility + 0.01);
    }
    
    // Update rain
    if (this.type === 'rainy' || this.type === 'stormy') {
      this.rainAmount = Math.min(100, this.rainAmount + 2);
    } else {
      this.rainAmount = Math.max(0, this.rainAmount - 1);
    }
    
    // Update cloud cover
    if (this.type === 'clear') {
      this.cloudCover = Math.max(0, this.cloudCover - 0.05);
    } else if (this.type === 'cloudy') {
      this.cloudCover = MathUtils.lerp(this.cloudCover, 0.5, 0.05);
    } else if (this.type === 'rainy' || this.type === 'stormy' || this.type === 'snowy') {
      this.cloudCover = Math.min(1, this.cloudCover + 0.03);
    }
  }

  /**
   * Change weather type
   */
  changeWeather() {
    const rand = Math.random();
    this.duration = 0;
    this.maxDuration = MathUtils.randomInt(50, 200);
    
    if (rand < 0.5) {
      this.type = 'clear';
      this.intensity = 0;
    } else if (rand < 0.7) {
      this.type = 'cloudy';
      this.intensity = Math.random() * 0.4;
    } else if (rand < 0.85) {
      this.type = 'rainy';
      this.intensity = 0.3 + Math.random() * 0.5;
    } else if (rand < 0.95) {
      this.type = 'stormy';
      this.intensity = 0.6 + Math.random() * 0.4;
    } else {
      this.type = 'snowy';
      this.intensity = 0.4 + Math.random() * 0.4;
    }
  }

  /**
   * Get weather effects
   */
  getEffects() {
    const effects = {
      movementSpeed: 1,
      visibility: this.visibility,
      cropGrowth: 1,
      buildingSpeed: 1,
      combatAccuracy: 1
    };
    
    if (this.type === 'rainy') {
      effects.movementSpeed = 0.8;
      effects.cropGrowth = 1.2;
      effects.buildingSpeed = 0.7;
      effects.combatAccuracy = 0.9;
    } else if (this.type === 'stormy') {
      effects.movementSpeed = 0.6;
      effects.cropGrowth = 0.5;
      effects.buildingSpeed = 0.3;
      effects.combatAccuracy = 0.7;
    } else if (this.type === 'snowy') {
      effects.movementSpeed = 0.7;
      effects.cropGrowth = 0.3;
      effects.buildingSpeed = 0.6;
      effects.combatAccuracy = 0.8;
    } else if (this.type === 'cloudy') {
      effects.cropGrowth = 0.8;
    }
    
    return effects;
  }

  /**
   * Get weather name
   */
  getWeatherName() {
    const names = {
      clear: 'Clear Skies',
      cloudy: 'Cloudy',
      rainy: 'Rainy',
      stormy: 'Stormy',
      snowy: 'Snowy'
    };
    return names[this.type] || 'Unknown';
  }
}
