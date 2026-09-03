/**
 * Economy System - Trade, production, and resources
 * Manages economic simulation
 */

class EconomySystem {
  constructor() {
    this.globalMarket = new Map();
    this.priceHistory = new Map();
    this.tradeRoutes = [];
    this.initializeMarket();
  }

  /**
   * Initialize global market
   */
  initializeMarket() {
    this.setPrice('food', 1);
    this.setPrice('wood', 2);
    this.setPrice('stone', 2);
    this.setPrice('gold', 10);
    this.setPrice('iron', 5);
    this.setPrice('cloth', 3);
    this.setPrice('tools', 8);
    this.setPrice('weapons', 15);
  }

  /**
   * Set market price
   */
  setPrice(item, price) {
    this.globalMarket.set(item, price);
    
    if (!this.priceHistory.has(item)) {
      this.priceHistory.set(item, []);
    }
    
    this.priceHistory.get(item).push(price);
  }

  /**
   * Get item price
   */
  getPrice(item) {
    return this.globalMarket.get(item) || 1;
  }

  /**
   * Update prices based on supply and demand
   */
  updatePrices() {
    for (const [item, price] of this.globalMarket) {
      const demand = Math.random() * 2; // 0-2x multiplier
      const supply = Math.random() * 2;
      const fluctuation = (demand / supply) * 0.1;
      
      const newPrice = Math.max(0.5, price * (1 + fluctuation));
      this.setPrice(item, newPrice);
    }
  }

  /**
   * Calculate trade profit
   */
  calculateTradeProfit(civFrom, civTo, item, quantity) {
    const basePrice = this.getPrice(item);
    const priceFrom = basePrice * civFrom.economy / 1000;
    const priceTo = basePrice * civTo.economy / 1000;
    
    const profit = (priceTo - priceFrom) * quantity;
    return profit;
  }

  /**
   * Create trade route
   */
  createTradeRoute(civFrom, civTo, item, quantity) {
    const route = {
      from: civFrom.id,
      to: civTo.id,
      item: item,
      quantity: quantity,
      profit: this.calculateTradeProfit(civFrom, civTo, item, quantity),
      active: true,
      duration: 0
    };
    
    this.tradeRoutes.push(route);
    return route;
  }

  /**
   * Process trade
   */
  processTrade(civFrom, civTo, item, quantity) {
    const price = this.getPrice(item);
    const totalCost = price * quantity;
    
    if (civFrom.economy >= totalCost) {
      civFrom.economy -= totalCost;
      civTo.economy += totalCost * 0.8; // 20% trade fee
      return true;
    }
    return false;
  }

  /**
   * Calculate taxation
   */
  calculateTaxation(civilization) {
    const baseIncome = civilization.population.length * 10;
    const taxModifier = 1 + (civilization.happiness / 100) * 0.5;
    return baseIncome * taxModifier;
  }

  /**
   * Calculate production efficiency
   */
  calculateProductionEfficiency(civilization) {
    const workerRatio = this.getWorkerRatio(civilization);
    const happinessModifier = civilization.happiness / 100;
    const technologyModifier = 1 + (civilization.technology * 0.1);
    
    return workerRatio * happinessModifier * technologyModifier;
  }

  /**
   * Get worker ratio
   */
  getWorkerRatio(civilization) {
    const totalWorkers = civilization.population.filter(p => p.job !== null).length;
    return totalWorkers / Math.max(1, civilization.population.length);
  }

  /**
   * Update economy
   */
  update(civilizations) {
    this.updatePrices();
    
    for (const civ of civilizations) {
      // Collect taxes
      const taxes = this.calculateTaxation(civ);
      civ.economy += taxes;
      
      // Production efficiency
      const efficiency = this.calculateProductionEfficiency(civ);
      civ.production = 100 * efficiency;
    }
  }
}
