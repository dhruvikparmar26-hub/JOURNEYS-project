import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-bg-elevated text-text-secondary flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-text-primary mb-1 tracking-tight">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;
