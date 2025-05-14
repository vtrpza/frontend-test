/**
 * Format a number to a price string with appropriate decimal places
 * @param price The price to format
 * @param decimals Number of decimal places (default: 8 for crypto)
 */
export const formatPrice = (price: string | number, decimals = 8): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0.00';
  }

  // Adjust decimals based on price magnitude
  const adjustedDecimals = numPrice >= 1000 ? 2 : 
                         numPrice >= 100 ? 4 : 
                         numPrice >= 10 ? 6 : 
                         decimals;
                         
  return numPrice.toFixed(adjustedDecimals);
};

/**
 * Format percentage change
 * @param percentChange Percentage change value
 */
export const formatPercentChange = (percentChange: string | number): string => {
  const numPercent = typeof percentChange === 'string' ? parseFloat(percentChange) : percentChange;
  
  if (isNaN(numPercent)) {
    return '0.00%';
  }
  
  const sign = numPercent >= 0 ? '+' : '';
  return `${sign}${numPercent.toFixed(2)}%`;
};

/**
 * Get CSS class based on price movement
 */
export const getPriceChangeClass = (percentChange: string | number): string => {
  const numPercent = typeof percentChange === 'string' ? parseFloat(percentChange) : percentChange;
  
  if (numPercent > 0) return 'price-positive';
  if (numPercent < 0) return 'price-negative';
  return '';
};

/**
 * Format timestamp to readable time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

/**
 * Find unique base assets from symbol list
 */
export const getUniqueBaseAssets = (symbols: Array<{ baseAsset: string }>): string[] => {
  const baseAssets = symbols.map(s => s.baseAsset);
  return [...new Set(baseAssets)].sort();
};
