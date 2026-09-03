/**
 * AI System - Advanced pathfinding and decision making
 * A* pathfinding, behavior trees, and utility AI
 */

class AISystem {
  constructor(world) {
    this.world = world;
    this.pathfindingCache = new Map();
  }

  /**
   * A* Pathfinding algorithm
   */
  findPath(startX, startY, endX, endY, maxSteps = 100) {
    const openSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const start = `${Math.floor(startX)},${Math.floor(startY)}`;
    const end = `${Math.floor(endX)},${Math.floor(endY)}`;
    
    openSet.add(start);
    gScore.set(start, 0);
    fScore.set(start, this.heuristic(startX, startY, endX, endY));
    
    let steps = 0;
    
    while (openSet.size > 0 && steps < maxSteps) {
      steps++;
      
      // Find node with lowest fScore
      let current = null;
      let lowestF = Infinity;
      
      for (const node of openSet) {
        const f = fScore.get(node) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      }
      
      if (current === end) {
        return this.reconstructPath(cameFrom, current);
      }
      
      openSet.delete(current);
      const [cx, cy] = current.split(',').map(Number);
      
      // Check neighbors
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          
          const nx = cx + dx;
          const ny = cy + dy;
          const neighbor = `${nx},${ny}`;
          
          const tentativeG = (gScore.get(current) || 0) + Math.sqrt(dx * dx + dy * dy);
          const neighborG = gScore.get(neighbor) || Infinity;
          
          if (tentativeG < neighborG) {
            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeG);
            fScore.set(neighbor, tentativeG + this.heuristic(nx, ny, endX, endY));
            
            if (!openSet.has(neighbor)) {
              openSet.add(neighbor);
            }
          }
        }
      }
    }
    
    return []; // No path found
  }

  /**
   * Heuristic function for A*
   */
  heuristic(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Reconstruct path from A*
   */
  reconstructPath(cameFrom, current) {
    const path = [current];
    
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      path.unshift(current);
    }
    
    return path;
  }

  /**
   * Get decision score for different behaviors
   */
  getUtilityScores(entity) {
    const scores = {};
    
    // Survival behaviors
    if (entity.health < entity.maxHealth * 0.3) {
      scores.healing = 0.9;
    }
    
    if (entity.energy < 30) {
      scores.resting = 0.8;
    }
    
    if (entity.hunger > 70) {
      scores.eating = 0.95;
    }
    
    // Social behaviors
    if (entity.happiness < 50) {
      scores.socializing = 0.7;
    }
    
    // Exploration
    scores.exploring = 0.3;
    
    // Fighting
    if (entity.strength > 10) {
      scores.fighting = 0.4;
    }
    
    return scores;
  }

  /**
   * Choose best behavior based on utility
   */
  chooseBehavior(entity) {
    const scores = this.getUtilityScores(entity);
    let bestBehavior = 'idle';
    let bestScore = 0;
    
    for (const [behavior, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestBehavior = behavior;
      }
    }
    
    return bestBehavior;
  }
}
