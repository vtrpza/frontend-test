import type { TickerData } from '../../types';

export interface BasePriceCardProps {
  symbol: string;
  data?: TickerData;
  refreshing?: boolean;
  onFavoriteToggle?: (symbol: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
}

export type CardViewMode = 'compact' | 'comfortable' | 'detailed';
