import React from 'react';
import { ErrorState } from '../ui/ErrorState';

interface SearchErrorProps {
  message?: string;
  onRetry: () => void;
}

export const SearchError: React.FC<SearchErrorProps> = ({
  message = 'Unable to fetch live schemes from official sources.',
  onRetry,
}) => (
  <ErrorState
    title="Unable to fetch live schemes"
    description={message}
    onRetry={onRetry}
    retryLabel="Retry Search"
  />
);
