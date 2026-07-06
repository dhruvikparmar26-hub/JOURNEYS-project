import React from 'react';

const BudgetBar = ({
  spent,
  budgetMin,
  budgetMax,
  currency = 'INR',
}) => {
  const budgetPercentage = budgetMax > 0 ? (spent / budgetMax) * 100 : 0;
  const isOverBudget = spent > budgetMax;
  const isUnderMinBudget = spent < budgetMin;

  const getBudgetStatusColor = () => {
    if (isOverBudget) return 'bg-danger';
    if (isUnderMinBudget) return 'bg-accent-blue';
    return 'bg-accent-gold'; // Electric Mint
  };

  const getBudgetStatusTextColor = () => {
    if (isOverBudget) return 'text-danger';
    if (isUnderMinBudget) return 'text-accent-blue';
    return 'text-success'; // Safe green
  };

  const getBudgetStatusText = () => {
    if (isOverBudget) return 'Over budget';
    if (isUnderMinBudget) return 'Under minimum budget';
    return 'Within budget';
  };

  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-text-secondary">
          Budget: {symbol}{budgetMin?.toLocaleString()} - {symbol}{budgetMax?.toLocaleString()}
        </span>
        <span className={`font-bold ${getBudgetStatusTextColor()}`}>
          {getBudgetStatusText()}
        </span>
      </div>
      <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden border border-border/30">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBudgetStatusColor()}`}
          style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
        <span>{symbol}{spent?.toLocaleString()} spent</span>
        <span className="numeric font-bold">{budgetPercentage.toFixed(0)}% of max budget</span>
      </div>
    </div>
  );
};

export default BudgetBar;
