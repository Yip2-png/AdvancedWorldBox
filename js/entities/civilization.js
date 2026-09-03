/**
 * Civilization System
 * Manage civilizations, culture, technology, and government
 */

class Civilization {
  constructor(name, x, y, color = '#3498db') {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.centerX = x;
    this.centerY = y;
    this.color = color;
    this.population = [];
    this.buildings = [];
    this.territory = new Set();
    this.age = 0;
    this.government = 'tribal'; // tribal, monarchy, democracy, theocracy, empire
    this.culture = 50;
    this.happiness = 60;
    this.technology = 1; // Tech level 1-10
    this.militaryStrength = 0;
    this.economy = 1000; // Gold
    this.food = 500;
    this.production = 100;
    this.relations = new Map(); // Relations with other civilizations
    this.policies = [];
    this.research = null; // Current research
    this.laws = [];
    this.capital = null;
    this.leader = null;
    this.wars = [];
    this.alliances = [];
    this.tradeRoutes = [];
    this.wonders = [];
  }

  /**
   * Update civilization
   */
  update(world) {
    this.age++;

    // Update population needs
    this.updatePopulation(world);

    // Update buildings
    this.updateBuildings(world);

    // Update economy
    this.updateEconomy();

    // Update military
    this.updateMilitary();

    // Research
    this.updateResearch();

    // Diplomacy
    this.updateDiplomacy();
  }

  /**
   * Update population
   */
  updatePopulation(world) {
    for (let i = this.population.length - 1; i >= 0; i--) {
      const citizen = this.population[i];
      citizen.update(world);

      if (citizen.isDead && citizen.isDead()) {
        this.population.splice(i, 1);
      }
    }

    // Birth rate based on happiness
    if (this.happiness > 60 && this.food > this.population.length * 10) {
      const birthChance = (this.happiness / 100) * 0.01;
      if (Math.random() < birthChance) {
        this.addCitizen(new Human(this.centerX, this.centerY, `Citizen ${this.population.length}`));
      }
    }
  }

  /**
   * Update buildings
   */
  updateBuildings(world) {
    for (const building of this.buildings) {
      building.update(this);
    }
  }

  /**
   * Update economy
   */
  updateEconomy() {
    // Food consumption
    const foodConsumption = this.population.length * 0.5;
    this.food = Math.max(0, this.food - foodConsumption);

    // Food production from farms
    const farms = this.buildings.filter(b => b.type === 'farm');
    const foodProduction = farms.length * 50;
    this.food += foodProduction;

    // Resource production
    const goldProduction = this.production * 0.1;
    this.economy += goldProduction;

    // Maintenance costs
    const maintenanceCost = this.buildings.length * 5;
    this.economy -= maintenanceCost;

    // Update happiness
    this.happiness += this.calculateHappinessChange();
    this.happiness = MathUtils.clamp(this.happiness, 0, 100);
  }

  /**
   * Calculate happiness change
   */
  calculateHappinessChange() {
    let change = 0;

    // Food affects happiness
    if (this.food < this.population.length * 5) {
      change -= 2;
    } else {
      change += 0.5;
    }

    // Culture affects happiness
    change += this.culture * 0.01;

    // Wars reduce happiness
    change -= this.wars.length * 2;

    return change;
  }

  /**
   * Update military
   */
  updateMilitary() {
    const soldiers = this.population.filter(p => p.job === 'soldier');
    this.militaryStrength = soldiers.length * (this.technology * 10);
  }

  /**
   * Update research
   */
  updateResearch() {
    if (this.research) {
      this.research.progress += (this.technology * 10);

      if (this.research.progress >= this.research.costToResearch) {
        this.completeResearch();
      }
    }
  }

  /**
   * Complete research
   */
  completeResearch() {
    if (!this.research) return;

    const tech = this.research.name;
    this.technology = Math.min(10, this.technology + 1);
    this.research = null;

    // Apply tech benefits
    this.applyTechBonus(tech);
  }

  /**
   * Apply technology bonus
   */
  applyTechBonus(tech) {
    switch (tech) {
      case 'agriculture':
        this.food += 200;
        break;
      case 'metalworking':
        this.militaryStrength *= 1.5;
        break;
      case 'writing':
        this.culture += 50;
        break;
      case 'engineering':
        this.production *= 1.3;
        break;
    }
  }

  /**
   * Update diplomacy
   */
  updateDiplomacy() {
    // Manage relations
    for (const [civId, relation] of this.relations) {
      relation.time++;
      if (relation.type === 'alliance') {
        relation.strength += 0.1;
      } else if (relation.type === 'enemy') {
        relation.strength += 0.2;
      }
    }
  }

  /**
   * Add citizen
   */
  addCitizen(human) {
    human.civilization = this;
    this.population.push(human);
  }

  /**
   * Add building
   */
  addBuilding(building) {
    building.civilization = this;
    this.buildings.push(building);
    this.territory.add(building.x + ',' + building.y);
  }

  /**
   * Start research
   */
  startResearch(techName) {
    this.research = {
      name: techName,
      progress: 0,
      costToResearch: 1000
    };
  }

  /**
   * Set government
   */
  setGovernment(type) {
    this.government = type;
  }

  /**
   * Declare war
   */
  declareWar(otherCiv) {
    this.wars.push(otherCiv.id);
    this.relations.set(otherCiv.id, { type: 'enemy', strength: 50, time: 0 });
  }

  /**
   * Make peace
   */
  makePeace(otherCiv) {
    const index = this.wars.indexOf(otherCiv.id);
    if (index > -1) {
      this.wars.splice(index, 1);
      this.relations.delete(otherCiv.id);
    }
  }

  /**
   * Form alliance
   */
  formAlliance(otherCiv) {
    this.alliances.push(otherCiv.id);
    this.relations.set(otherCiv.id, { type: 'alliance', strength: 50, time: 0 });
  }

  /**
   * Get civilization info
   */
  getInfo() {
    return {
      name: this.name,
      population: this.population.length,
      government: this.government,
      happiness: Math.floor(this.happiness),
      culture: Math.floor(this.culture),
      technology: this.technology,
      economy: Math.floor(this.economy),
      food: Math.floor(this.food),
      militaryStrength: Math.floor(this.militaryStrength),
      buildings: this.buildings.length,
      wars: this.wars.length
    };
  }
}
