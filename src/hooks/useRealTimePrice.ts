import { useState, useEffect, useRef, useCallback } from 'react';
import { CryptoAsset } from '../types/crypto';

interface PriceUpdate {
  id: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: Date;
}

interface UseRealTimePriceReturn {
  prices: Map<string, PriceUpdate>;
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionType: 'websocket' | 'polling' | 'simulation';
  reconnectAttempts: number;
}

interface BinanceTickerData {
  s: string;    // Symbol
  c: string;    // Close price (current price)
  P: string;    // Price change percent (24h)
  v: string;    // Volume (24h)
}

interface BinanceStreamData {
  stream: string;
  data: BinanceTickerData;
}

// Symbol mapping - match your crypto IDs to Binance symbols
const SYMBOL_MAPPING: Record<string, string> = {
  '1': 'BTCUSDT',     // Bitcoin
  '2': 'ETHUSDT',     // Ethereum  
  '3': 'SOLUSDT',     // Solana
  '4': 'ADAUSDT',     // Cardano
  '5': 'MATICUSDT',   // Polygon
  '6': 'LINKUSDT',    // Chainlink
  '7': 'AVAXUSDT',    // Avalanche
  '8': 'DOTUSDT',     // Polkadot
  '9': 'UNIUSDT',     // Uniswap
  '10': 'ATOMUSDT',   // Cosmos
};

export const useRealTimePrice = (cryptoData: CryptoAsset[]): UseRealTimePriceReturn => {
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'simulation'>('simulation');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPriceUpdateRef = useRef<Map<string, number>>(new Map());

  // Configuration
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  const POLLING_INTERVAL = 10000; // 10 seconds for API fallback
  const PRICE_SMOOTHING_THRESHOLD = 100; // ms between price updates for same symbol

  // Initialize prices
  useEffect(() => {
    const initialPrices = new Map<string, PriceUpdate>();
    
    cryptoData.forEach(crypto => {
      initialPrices.set(crypto.id, {
        id: crypto.id,
        price: crypto.price,
        change24h: crypto.change24h,
        volume24h: crypto.volume24h,
        timestamp: new Date(),
      });
    });
    
    setPrices(initialPrices);
  }, [cryptoData]);

  // Smooth price updates to prevent jitter
  const updatePriceSmooth = useCallback((cryptoId: string, newPrice: PriceUpdate) => {
    const now = Date.now();
    const lastUpdate = lastPriceUpdateRef.current.get(cryptoId) || 0;
    
    // Throttle updates per symbol to prevent excessive re-renders
    if (now - lastUpdate < PRICE_SMOOTHING_THRESHOLD) {
      return;
    }
    
    lastPriceUpdateRef.current.set(cryptoId, now);
    
    setPrices(prev => {
      const updated = new Map(prev);
      updated.set(cryptoId, newPrice);
      return updated;
    });
    
    setLastUpdate(new Date());
  }, []);

  // WebSocket connection for real-time data
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get Binance symbols for our crypto assets
      const symbols = cryptoData
        .map(crypto => SYMBOL_MAPPING[crypto.id])
        .filter(Boolean)
        .map(symbol => `${symbol.toLowerCase()}@ticker`);

      if (symbols.length === 0) {
        console.warn('No Binance symbols mapped, falling back to polling');
        startPolling();
        return;
      }

      // Binance WebSocket stream URL
      const streamNames = symbols.join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamNames}`;
      
      console.log('🚀 Connecting to Binance WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected - Real-time prices active!');
        setIsConnected(true);
        setConnectionType('websocket');
        setReconnectAttempts(0);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: BinanceStreamData = JSON.parse(event.data);
          
          // Find corresponding crypto asset
          const cryptoEntry = Object.entries(SYMBOL_MAPPING).find(
            ([_, symbol]) => data.stream.includes(symbol.toLowerCase())
          );
          
          if (!cryptoEntry) return;
          
          const [cryptoId] = cryptoEntry;
          const tickerData = data.data;
          
          const priceUpdate: PriceUpdate = {
            id: cryptoId,
            price: parseFloat(tickerData.c),
            change24h: parseFloat(tickerData.P),
            volume24h: parseFloat(tickerData.v),
            timestamp: new Date(),
          };
          
          updatePriceSmooth(cryptoId, priceUpdate);
          
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_DELAY * Math.pow(2, reconnectAttempts)); // Exponential backoff
        } else {
          console.log('Max reconnect attempts reached, falling back to polling');
          startPolling();
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        startPolling();
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      startPolling();
    }
  }, [cryptoData, reconnectAttempts, updatePriceSmooth]);

  // API polling fallback
  const fetchBinancePrices = useCallback(async () => {
    try {
      const symbols = cryptoData
        .map(crypto => SYMBOL_MAPPING[crypto.id])
        .filter(Boolean);
      
      if (symbols.length === 0) {
        // Fall back to simulation if no symbols mapped
        startSimulation();
        return;
      }

      // Binance 24hr ticker API
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const tickers = await response.json();
      
      // Process each ticker
      tickers.forEach((ticker: any) => {
        const cryptoEntry = Object.entries(SYMBOL_MAPPING).find(
          ([_, symbol]) => symbol === ticker.symbol
        );
        
        if (!cryptoEntry) return;
        
        const [cryptoId] = cryptoEntry;
        
        const priceUpdate: PriceUpdate = {
          id: cryptoId,
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.volume),
          timestamp: new Date(),
        };
        
        updatePriceSmooth(cryptoId, priceUpdate);
      });
      
      if (!isConnected) {
        setIsConnected(true);
        setConnectionType('polling');
        console.log('📊 API polling active - 10s updates');
      }
      
    } catch (error) {
      console.error('Failed to fetch from Binance API:', error);
      
      if (connectionType === 'polling') {
        setIsConnected(false);
        // Try WebSocket again after API failure
        setTimeout(connectWebSocket, 5000);
      }
    }
  }, [cryptoData, isConnected, connectionType, updatePriceSmooth, connectWebSocket]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    console.log('🔄 Starting API polling fallback');
    setConnectionType('polling');
    
    // Immediate fetch
    fetchBinancePrices();
    
    // Set up interval
    pollingIntervalRef.current = setInterval(fetchBinancePrices, POLLING_INTERVAL);
  }, [fetchBinancePrices]);

  // Simulation fallback (your current implementation, simplified)
  const startSimulation = useCallback(() => {
    console.log('🎮 Starting price simulation');
    setConnectionType('simulation');
    setIsConnected(true);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = new Map(prevPrices);
        const now = new Date();
        
        cryptoData.forEach(crypto => {
          const currentPrice = prevPrices.get(crypto.id);
          if (!currentPrice) return;

          // Simple simulation (much simplified from your original)
          const volatility = Math.max(0.0001, Math.min(0.01, 1000000000 / crypto.marketCap));
          const randomChange = (Math.random() - 0.5) * volatility;
          const newPrice = Math.max(currentPrice.price * (1 + randomChange), crypto.price * 0.5);
          
          newPrices.set(crypto.id, {
            id: crypto.id,
            price: newPrice,
            change24h: currentPrice.change24h + (randomChange * 10),
            volume24h: currentPrice.volume24h * (1 + (Math.random() - 0.5) * 0.02),
            timestamp: now,
          });
        });
        
        setLastUpdate(now);
        return newPrices;
      });
    }, 200); // 200ms updates for smooth simulation
  }, [cryptoData]);

  // Main connection logic
  useEffect(() => {
    if (cryptoData.length === 0) return;

    // Try WebSocket first
    connectWebSocket();
    
    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket, cryptoData]);

  return { 
    prices, 
    isConnected, 
    lastUpdate, 
    connectionType, 
    reconnectAttempts 
  };
};
