import axios from 'axios';
import type { BinanceSymbol } from '../types';

const BASE_URL = 'https://api.binance.com/api/v3';

export const fetchSymbols = async (): Promise<BinanceSymbol[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/exchangeInfo`);
    return response.data.symbols.map((symbol: any) => ({
      symbol: symbol.symbol,
      status: symbol.status,
      baseAsset: symbol.baseAsset,
      quoteAsset: symbol.quoteAsset,
      baseAssetPrecision: symbol.baseAssetPrecision,
      quoteAssetPrecision: symbol.quoteAssetPrecision,
    }));
  } catch (error) {
    console.error('Error fetching symbols:', error);
    throw error;
  }
};
