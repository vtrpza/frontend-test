import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import type { BinanceSymbol, SymbolList, SymbolTickerData } from '../types';
import type { WebsocketMessage } from '../types/websocket';
import { fetchSymbols } from '../services/api';
import { BinanceWebsocketService } from '../services/websocket';

interface SymbolContextType {
  symbols: BinanceSymbol[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  symbolLists: SymbolList[];
  activeListId: string | null;
  tickerData: SymbolTickerData;
  createSymbolList: (name: string) => void;
  deleteSymbolList: (id: string) => void;
  addSymbolToList: (listId: string, symbol: string) => void;
  addSymbolsToList: (listId: string, symbols: string[]) => void;
  removeSymbolFromList: (listId: string, symbol: string) => void;
  setActiveList: (listId: string) => void;
}

const SymbolContext = createContext<SymbolContextType | undefined>(undefined);

export const useSymbolContext = () => {
  const context = useContext(SymbolContext);
  if (context === undefined) {
    throw new Error('useSymbolContext must be used within a SymbolProvider');
  }
  return context;
};

interface SymbolProviderProps {
  children: ReactNode;
}

export const SymbolProvider: React.FC<SymbolProviderProps> = ({ children }) => {
  const [symbols, setSymbols] = useState<BinanceSymbol[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolLists, setSymbolLists] = useState<SymbolList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [tickerData, setTickerData] = useState<SymbolTickerData>({});
  
  const websocketService = useRef(new BinanceWebsocketService());
  const pendingConnectionRef = useRef(false);
  const connectionTimeoutRef = useRef<number | null>(null);

  // Fetch all available symbols
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSymbols();
        setSymbols(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching symbols');
      } finally {
        setIsLoading(false);
      }
    };

    loadSymbols();
  }, []);

  // Function to safely connect to WebSocket
  const connectToWebSocket = (symbols: string[]) => {
    // Set connecting state
    setIsConnecting(true);
    pendingConnectionRef.current = true;
    
    // Clear any existing timeout
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
    }

    // Disconnect existing connection first
    websocketService.current.disconnect();
    
    // Small delay to ensure proper disconnection before new connection
    connectionTimeoutRef.current = window.setTimeout(() => {
      try {
        // Connect to WebSocket with new symbols
        websocketService.current.connect(symbols);
        console.log('WebSocket connected with symbols:', symbols);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket');
        console.error('WebSocket connection error:', err);
      } finally {
        // Reset states after connection attempt
        setIsConnecting(false);
        pendingConnectionRef.current = false;
        connectionTimeoutRef.current = null;
      }
    }, 500); // 500ms delay for safety
  };

  // Connect to WebSocket when active list changes
  useEffect(() => {
    const activeList = symbolLists.find(list => list.id === activeListId);
    
    if (activeList && activeList.symbols.length > 0) {
      // Connect to WebSocket
      connectToWebSocket(activeList.symbols);
      
      // Add message handler
      const handleMessage = (message: WebsocketMessage) => {
        if (message && message.data && message.data.s) {
          const symbol = message.data.s.toLowerCase();
          setTickerData(prev => ({
            ...prev,
            [symbol]: message.data
          }));
          
          // Log the first message for debugging (can be removed in production)
          if (!Object.keys(tickerData).length) {
            console.log('First ticker data received:', message.data);
          }
        }
      };
      
      websocketService.current.addMessageHandler(handleMessage);
      
      // Cleanup on component unmount
      return () => {
        websocketService.current.removeMessageHandler(handleMessage);
        if (!pendingConnectionRef.current) {
          websocketService.current.disconnect();
        }
      };
    } else {
      // No symbols to connect with, reset ticker data
      setTickerData({});
    }
    
    return () => {
      if (!pendingConnectionRef.current) {
        websocketService.current.disconnect();
      }
    };
  }, [activeListId, symbolLists]);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current !== null) {
        window.clearTimeout(connectionTimeoutRef.current);
      }
      websocketService.current.disconnect();
    };
  }, []);

  // Create a new symbol list
  const createSymbolList = (name: string) => {
    const newList: SymbolList = {
      id: `list_${Date.now()}`,
      name,
      symbols: []
    };
    
    setSymbolLists(prev => [...prev, newList]);
    
    // If this is the first list, make it active
    if (symbolLists.length === 0) {
      setActiveListId(newList.id);
    }
  };

  // Delete a symbol list
  const deleteSymbolList = (id: string) => {
    setSymbolLists(prev => prev.filter(list => list.id !== id));
    
    // If the active list is deleted, set active to null or another list
    if (activeListId === id) {
      const remainingLists = symbolLists.filter(list => list.id !== id);
      setActiveListId(remainingLists.length > 0 ? remainingLists[0].id : null);
    }
  };

  // Add a symbol to a list
  const addSymbolToList = (listId: string, symbol: string) => {
    // If already connecting, don't allow new changes
    if (isConnecting || pendingConnectionRef.current) {
      console.log('Connection in progress, please wait...');
      return;
    }
    
    setSymbolLists(prev =>
      prev.map(list =>
        list.id === listId && !list.symbols.includes(symbol)
          ? { ...list, symbols: [...list.symbols, symbol] }
          : list
      )
    );
  };

  // Add multiple symbols to a list
  const addSymbolsToList = (listId: string, symbolsToAdd: string[]) => {
    // If already connecting, don't allow new changes
    if (isConnecting || pendingConnectionRef.current) {
      console.log('Connection in progress, please wait...');
      return;
    }
    
    setSymbolLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          // Filter out symbols that are already in the list
          const newSymbols = symbolsToAdd.filter(symbol => !list.symbols.includes(symbol));
          return { ...list, symbols: [...list.symbols, ...newSymbols] };
        }
        return list;
      })
    );
  };

  // Remove a symbol from a list
  const removeSymbolFromList = (listId: string, symbol: string) => {
    // If already connecting, don't allow new changes
    if (isConnecting || pendingConnectionRef.current) {
      console.log('Connection in progress, please wait...');
      return;
    }
    
    setSymbolLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, symbols: list.symbols.filter(s => s !== symbol) }
          : list
      )
    );
  };

  // Set the active list
  const setActiveList = (listId: string) => {
    // If already connecting, don't allow new changes
    if (isConnecting || pendingConnectionRef.current) {
      console.log('Connection in progress, please wait...');
      return;
    }
    
    setActiveListId(listId);
  };

  const value = {
    symbols,
    isLoading,
    isConnecting,
    error,
    symbolLists,
    activeListId,
    tickerData,
    createSymbolList,
    deleteSymbolList,
    addSymbolToList,
    addSymbolsToList,
    removeSymbolFromList,
    setActiveList
  };

  return (
    <SymbolContext.Provider value={value}>
      {children}
    </SymbolContext.Provider>
  );
};
