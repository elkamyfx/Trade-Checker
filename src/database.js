// Database service using localStorage for persistence across browser sessions
// For production, this could be replaced with a proper database backend

class DatabaseService {
  constructor() {
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Initialize trades table if it doesn't exist
    const trades = localStorage.getItem('trades');
    if (!trades) {
      localStorage.setItem('trades', JSON.stringify([]));
    }
  }

  // Save a new trade record
  saveTrade(strategy, parameters, result, comments = '') {
    try {
      const trades = this.getAllTrades();
      const newTrade = {
        id: Date.now().toString(), // Simple ID generation
        strategy,
        parameters,
        result,
        comments,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
      };
      
      trades.push(newTrade);
      localStorage.setItem('trades', JSON.stringify(trades));
      return { success: true, trade: newTrade };
    } catch (error) {
      console.error('Error saving trade:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all trades
  getAllTrades() {
    try {
      const trades = localStorage.getItem('trades');
      return trades ? JSON.parse(trades) : [];
    } catch (error) {
      console.error('Error retrieving trades:', error);
      return [];
    }
  }

  // Find historical matches for given parameters
  findHistoricalMatches(strategy, parameters) {
    try {
      const allTrades = this.getAllTrades();
      
      // Filter trades by strategy first
      const strategyTrades = allTrades.filter(trade => trade.strategy === strategy);
      
      // Find exact parameter matches (all 15 parameters must match)
      const matches = strategyTrades.filter(trade => {
        return this.parametersMatch(trade.parameters, parameters);
      });

      // Group by unique parameter combinations and count occurrences
      const groupedResults = this.groupMatchesByResult(matches);
      
      return {
        success: true,
        matches: groupedResults,
        totalOccurrences: matches.length
      };
    } catch (error) {
      console.error('Error finding historical matches:', error);
      return { success: false, error: error.message, matches: [], totalOccurrences: 0 };
    }
  }

  // Check if two parameter sets match exactly
  parametersMatch(params1, params2) {
    const keys = [
      'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 
      'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15'
    ];
    
    return keys.every(key => params1[key] === params2[key]);
  }

  // Group matches by result and collect all comments
  groupMatchesByResult(matches) {
    const grouped = {};
    
    matches.forEach(match => {
      const resultKey = match.result;
      if (!grouped[resultKey]) {
        grouped[resultKey] = {
          result: resultKey,
          count: 0,
          comments: [],
          dates: []
        };
      }
      
      grouped[resultKey].count++;
      if (match.comments && match.comments.trim()) {
        grouped[resultKey].comments.push({
          comment: match.comments,
          date: match.date,
          timestamp: match.timestamp
        });
      }
      grouped[resultKey].dates.push(match.date);
    });

    return Object.values(grouped);
  }

  // Get trades by strategy
  getTradesByStrategy(strategy) {
    try {
      const allTrades = this.getAllTrades();
      return allTrades.filter(trade => trade.strategy === strategy);
    } catch (error) {
      console.error('Error retrieving trades by strategy:', error);
      return [];
    }
  }

  // Delete a trade by ID
  deleteTrade(id) {
    try {
      const trades = this.getAllTrades();
      const filteredTrades = trades.filter(trade => trade.id !== id);
      localStorage.setItem('trades', JSON.stringify(filteredTrades));
      return { success: true };
    } catch (error) {
      console.error('Error deleting trade:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all trades (for testing/reset purposes)
  clearAllTrades() {
    try {
      localStorage.setItem('trades', JSON.stringify([]));
      return { success: true };
    } catch (error) {
      console.error('Error clearing trades:', error);
      return { success: false, error: error.message };
    }
  }

  // Export trades as JSON
  exportTrades() {
    try {
      const trades = this.getAllTrades();
      return { success: true, data: trades };
    } catch (error) {
      console.error('Error exporting trades:', error);
      return { success: false, error: error.message };
    }
  }

  // Import trades from JSON
  importTrades(tradesData) {
    try {
      if (!Array.isArray(tradesData)) {
        throw new Error('Invalid trades data format');
      }
      
      localStorage.setItem('trades', JSON.stringify(tradesData));
      return { success: true };
    } catch (error) {
      console.error('Error importing trades:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const dbService = new DatabaseService();

export default dbService;