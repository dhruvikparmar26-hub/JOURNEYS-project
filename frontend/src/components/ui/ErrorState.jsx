import React from 'react';
import { AlertCircle } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

const ErrorState = ({
  title = 'An error occurred',
  message = 'Failed to load content. Please try again.',
  retryLabel = 'Retry',
  onRetry,
  className = '',
}) => {
  return (
    <Card className={`border-danger/20 bg-[#fce8e6]/10 p-8 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#fce8e6] text-[#ba1a1a] flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#ba1a1a] mb-1 tracking-tight">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-danger/30 hover:bg-[#fce8e6]/25 hover:border-danger text-[#ba1a1a]">
          {retryLabel}
        </Button>
      )}
    </Card>
  );
};

export default ErrorState;
