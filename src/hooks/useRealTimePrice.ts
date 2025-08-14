import { useState, useEffect, useRef } from 'react';
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
}

export const useRealTimePrice = (cryptoData: CryptoAsset[]): UseRealTimePriceReturn => {
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const priceHistoryRef = useRef<Map<string, number[]>>(new Map());

  // Initialize price history for each crypto
  useEffect(() => {
    const initialPrices = new Map<string, PriceUpdate>();
    const initialHistory = new Map<string, number[]>();
    
    cryptoData.forEach(crypto => {
      initialPrices.set(crypto.id, {
        id: crypto.id,
        price: crypto.price,
        change24h: crypto.change24h,
        volume24h: crypto.volume24h,
        timestamp: new Date(),
      });
      
      // Initialize with some historical prices for smoother transitions
      const history = Array.from({ length: 20 }, (_, i) => 
        crypto.price * (0.98 + Math.random() * 0.04)
      );
      initialHistory.set(crypto.id, history);
    });
    
    setPrices(initialPrices);
    priceHistoryRef.current = initialHistory;
    setIsConnected(true);
  }, [cryptoData]);

  // Real-time price simulation
  useEffect(() => {
    if (!isConnected || cryptoData.length === 0) return;

    const updatePrices = () => {
      setPrices(prevPrices => {
        const newPrices = new Map(prevPrices);
        const now = new Date();
        
        cryptoData.forEach(crypto => {
          const currentPrice = prevPrices.get(crypto.id);
          if (!currentPrice) return;

          // Get price history for this crypto
          const history = priceHistoryRef.current.get(crypto.id) || [];
          
          // Calculate volatility based on market cap (larger coins are less volatile)
          const volatilityFactor = Math.max(0.0001, Math.min(0.01, 1000000000 / crypto.marketCap));
          
          // Generate realistic price movement with momentum
          const momentum = history.length >= 3 ? 
            (history[history.length - 1] - history[history.length - 3]) / history[history.length - 3] : 0;
          
          // Add some randomness with momentum bias
          const randomChange = (Math.random() - 0.5) * volatilityFactor;
          const momentumInfluence = momentum * 0.1; // 10% momentum influence
          const totalChange = randomChange + momentumInfluence;
          
          const newPrice = Math.max(
            currentPrice.price * (1 + totalChange),
            crypto.price * 0.5 // Don't go below 50% of original price
          );

          // Update price history
          const updatedHistory = [...history.slice(-19), newPrice];
          priceHistoryRef.current.set(crypto.id, updatedHistory);

          // Calculate 24h change based on price movement
          const priceChangeFromOriginal = ((newPrice - crypto.price) / crypto.price) * 100;
          const new24hChange = crypto.change24h + (priceChangeFromOriginal * 0.1);

          // Simulate volume changes
          const volumeChange = (Math.random() - 0.5) * 0.02; // ±2% volume change
          const newVolume = Math.max(
            currentPrice.volume24h * (1 + volumeChange),
            crypto.volume24h * 0.5
          );

          newPrices.set(crypto.id, {
            id: crypto.id,
            price: newPrice,
            change24h: new24hChange,
            volume24h: newVolume,
            timestamp: now,
          });
        });

        setLastUpdate(now);
        return newPrices;
      });
    };

    // Update every 200ms for smooth real-time feel
    intervalRef.current = setInterval(updatePrices, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, cryptoData]);

  return { prices, isConnected, lastUpdate };
};