import React, { useState, useCallback, useEffect } from 'react';
import type { TickerData } from '../types';
import { 
  CompactPriceCard, 
  ComfortablePriceCard, 
  SkeletonPriceCard
} from './price-cards';
import type { CardViewMode } from './price-cards';

interface PriceTickerCardProps {
  symbol: string;
  data?: TickerData;
  refreshing?: boolean;
  viewMode?: CardViewMode;
  onFavoriteToggle?: (symbol: string, isFavorite: boolean) => void;
}

/**
 * PriceTickerCard is a container component that renders different price card views
 * based on the viewMode prop. It manages common state and keyboard interactions.
 */
const PriceTickerCard: React.FC<PriceTickerCardProps> = ({ 
  symbol, 
  data, 
  refreshing = false, 
  viewMode = 'comfortable',
  onFavoriteToggle 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Handle favorite toggle with callback to parent if provided
  const handleFavoriteToggle = useCallback((_symbol: string, isFavorite: boolean) => {
    setIsFavorite(isFavorite);
    if (onFavoriteToggle) {
      onFavoriteToggle(_symbol, isFavorite);
    }
  }, [onFavoriteToggle]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (document.activeElement?.getAttribute('aria-label')?.includes(symbol)) {
      switch (e.key) {
        case 'f':
          handleFavoriteToggle(symbol, !isFavorite);
          break;
      }
    }
  }, [symbol, isFavorite, handleFavoriteToggle]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Show skeleton when data is loading or refreshing
  if (!data || refreshing) {
    return <SkeletonPriceCard viewMode={viewMode} refreshing={refreshing} symbol={symbol} />;
  }

  // Render appropriate card based on view mode
  switch (viewMode) {
    case 'compact':
      return (
        <CompactPriceCard
          symbol={symbol}
          data={data}
          isFavorite={isFavorite}
          onFavoriteToggle={handleFavoriteToggle}
        />
      );
    case 'comfortable':
    default:
      return (
        <ComfortablePriceCard
          symbol={symbol}
          data={data}
          isFavorite={isFavorite}
          onFavoriteToggle={handleFavoriteToggle}
        />
      );
  }
};

export default PriceTickerCard;