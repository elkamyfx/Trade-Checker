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

  // Get historical data grouped by parameter combinations
  getHistoricalDataGrouped(strategy = null) {
    try {
      const allTrades = this.getAllTrades();
      const filteredTrades = strategy ? 
        allTrades.filter(trade => trade.strategy === strategy) : 
        allTrades;

      // Group trades by parameter combinations
      const grouped = {};
      
      filteredTrades.forEach(trade => {
        // Create a unique key for the parameter combination
        const paramKey = this.createParameterKey(trade.parameters);
        
        if (!grouped[paramKey]) {
          grouped[paramKey] = {
            parameters: trade.parameters,
            strategy: trade.strategy,
            trades: [],
            totalOccurrences: 0,
            results: {},
            firstSeen: trade.date,
            lastSeen: trade.date
          };
        }
        
        grouped[paramKey].trades.push(trade);
        grouped[paramKey].totalOccurrences++;
        
        // Count results
        if (!grouped[paramKey].results[trade.result]) {
          grouped[paramKey].results[trade.result] = 0;
        }
        grouped[paramKey].results[trade.result]++;
        
        // Update date range
        if (new Date(trade.timestamp) < new Date(grouped[paramKey].firstSeen)) {
          grouped[paramKey].firstSeen = trade.date;
        }
        if (new Date(trade.timestamp) > new Date(grouped[paramKey].lastSeen)) {
          grouped[paramKey].lastSeen = trade.date;
        }
      });

      // Convert to array and sort by total occurrences (most frequent first)
      const groupedArray = Object.values(grouped)
        .sort((a, b) => b.totalOccurrences - a.totalOccurrences);

      return { success: true, data: groupedArray };
    } catch (error) {
      console.error('Error getting historical data:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Create a unique key for parameter combination
  createParameterKey(parameters) {
    const keys = [
      'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 
      'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15'
    ];
    
    return keys.map(key => `${key}:${parameters[key]}`).join('|');
  }

  // Get summary statistics
  getStatistics(strategy = null) {
    try {
      const allTrades = this.getAllTrades();
      const filteredTrades = strategy ? 
        allTrades.filter(trade => trade.strategy === strategy) : 
        allTrades;

      const stats = {
        totalTrades: filteredTrades.length,
        strategies: [...new Set(allTrades.map(trade => trade.strategy))],
        results: {},
        uniqueParameterCombinations: 0,
        dateRange: {
          first: null,
          last: null
        }
      };

      // Count results
      filteredTrades.forEach(trade => {
        if (!stats.results[trade.result]) {
          stats.results[trade.result] = 0;
        }
        stats.results[trade.result]++;
        
        // Update date range
        if (!stats.dateRange.first || new Date(trade.timestamp) < new Date(stats.dateRange.first)) {
          stats.dateRange.first = trade.date;
        }
        if (!stats.dateRange.last || new Date(trade.timestamp) > new Date(stats.dateRange.last)) {
          stats.dateRange.last = trade.date;
        }
      });

      // Count unique parameter combinations
      const uniqueParams = new Set();
      filteredTrades.forEach(trade => {
        uniqueParams.add(this.createParameterKey(trade.parameters));
      });
      stats.uniqueParameterCombinations = uniqueParams.size;

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { success: false, error: error.message, data: null };
    }
  }
}

// Create singleton instance
const dbService = new DatabaseService();

export default dbService;