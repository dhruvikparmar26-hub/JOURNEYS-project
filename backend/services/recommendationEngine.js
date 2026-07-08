import Destination from '../models/Destination.js';

/**
 * recommendationEngine
 * Returns personalized destination recommendations based on user style and interests.
 */

/**
 * Get recommendations based on user preference profile
 * @param {Object} userPreferences - { travelStyle, interests, language }
 * @param {number} limit - maximum recommendations to return
 */
export const getPersonalizedRecommendations = async (userPreferences = {}, limit = 4) => {
  try {
    const query = { isActive: true };

    const clauses = [];

    // Filter by travel style if defined
    if (userPreferences.travelStyle) {
      const budgetMap = {
        budget: { 'avgBudgetPerDay.midRange': { $lte: 3000 } },
        'mid-range': { 'avgBudgetPerDay.midRange': { $gt: 3000, $lte: 8000 } },
        luxury: { 'avgBudgetPerDay.luxury': { $gt: 12000 } }
      };
      
      const styleClause = budgetMap[userPreferences.travelStyle];
      if (styleClause) {
        clauses.push(styleClause);
      }
    }

    // Filter by interests (categories match)
    if (userPreferences.interests && userPreferences.interests.length > 0) {
      clauses.push({ categories: { $in: userPreferences.interests } });
    }

    if (clauses.length > 0) {
      query.$or = clauses;
    }

    // Retrieve matches ordered by popularity
    let recommendations = await Destination.find(query)
      .limit(limit)
      .sort({ popularityScore: -1 });

    // Fallback if no matching records found
    if (recommendations.length === 0) {
      recommendations = await Destination.find({ isActive: true })
        .limit(limit)
        .sort({ popularityScore: -1 });
    }

    return recommendations;
  } catch (error) {
    console.error('Recommendation engine error:', error);
    return [];
  }
};

/**
 * Get seasonal suggestions based on current month
 * @param {string} currentMonth - e.g. "December"
 * @param {number} limit
 */
export const getSeasonalRecommendations = async (currentMonth, limit = 4) => {
  try {
    const month = currentMonth || new Date().toLocaleString('en-US', { month: 'long' });
    
    // Find destinations where current month is within bestTimeToVisit limits
    const allDestinations = await Destination.find({ isActive: true });
    
    const seasonal = allDestinations.filter(dest => {
      if (!dest.bestTimeToVisit) return true;
      const fromMonth = dest.bestTimeToVisit.from;
      const toMonth = dest.bestTimeToVisit.to;
      
      // Basic month containment check
      const monthsOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const currentIdx = monthsOrder.indexOf(month);
      const fromIdx = monthsOrder.indexOf(fromMonth);
      const toIdx = monthsOrder.indexOf(toMonth);
      
      if (currentIdx === -1 || fromIdx === -1 || toIdx === -1) return true;
      
      if (fromIdx <= toIdx) {
        return currentIdx >= fromIdx && currentIdx <= toIdx;
      } else {
        // Crosses calendar year boundary (e.g., Oct to Mar)
        return currentIdx >= fromIdx || currentIdx <= toIdx;
      }
    });

    return seasonal.slice(0, limit);
  } catch (error) {
    console.error('Seasonal recommendation error:', error);
    return [];
  }
};
