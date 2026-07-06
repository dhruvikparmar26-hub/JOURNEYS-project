import React from 'react';
import Card from './ui/Card.jsx';
import BudgetBar from './ui/BudgetBar.jsx';
import { IndianRupee } from 'lucide-react';

/**
 * CostSummaryCard Component
 * 
 * Displays total estimated cost broken down by transport, lodging, and activities.
 * Shows progress bar comparing against user's budget (accent.gold under budget, accent.danger over).
 */
const CostSummaryCard = ({ itinerary, budgetMin, budgetMax }) => {
  const calculateCostBreakdown = () => {
    let transportCost = 0;
    let lodgingCost = 0;
    let activitiesCost = 0;

    // Extract costs from itinerary
    if (itinerary?.route?.costs) {
      // Use cab cost as default transport cost
      transportCost = itinerary.route.costs.cab?.cost || 0;
    }

    if (itinerary?.recommendedHotel) {
      lodgingCost = itinerary.recommendedHotel.totalCost || 0;
    }

    if (itinerary?.dailyPlan) {
      itinerary.dailyPlan.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            activitiesCost += activity.cost || 0;
          });
        }
        activitiesCost += day.dayCost || 0;
      });
    }

    const totalCost = transportCost + lodgingCost + activitiesCost;

    return {
      transport: transportCost,
      lodging: lodgingCost,
      activities: activitiesCost,
      total: totalCost,
    };
  };

  const costs = calculateCostBreakdown();

  return (
    <Card elevated noPadding className="overflow-hidden border border-border-subtle shadow-md bg-bg-surface">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle bg-bg-elevated/40 flex items-center gap-1.5">
        <IndianRupee className="w-4.5 h-4.5 text-accent-blue" />
        <h3 className="text-sm font-bold text-text-primary">Budget Analysis</h3>
      </div>
      
      <div className="p-5 space-y-5">
        {/* Total Cost */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Est. Cost</span>
          <span className="text-2xl font-extrabold text-[#006d35] font-sans numeric">
            ₹{costs.total.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Budget Progress Bar */}
        <BudgetBar
          spent={costs.total}
          budgetMin={budgetMin}
          budgetMax={budgetMax}
          currency="INR"
        />

        {/* Cost Breakdown */}
        <div className="space-y-3 pt-3 border-t border-border-subtle">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2.5">Expense Breakdown</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
              <span className="text-xs font-semibold text-text-secondary">Transport & Transit</span>
            </div>
            <span className="text-xs font-bold text-text-primary font-mono numeric">
              ₹{costs.transport.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-gold-dark" />
              <span className="text-xs font-semibold text-text-secondary">Hotel & Lodging</span>
            </div>
            <span className="text-xs font-bold text-text-primary font-mono numeric">
              ₹{costs.lodging.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="text-xs font-semibold text-text-secondary">Activities & Food</span>
            </div>
            <span className="text-xs font-bold text-text-primary font-mono numeric">
              ₹{costs.activities.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CostSummaryCard;
