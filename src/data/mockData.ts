import { CryptoAsset, MarketStats, HistoricalDataPoint, TechnicalIndicator } from '../types/crypto';

// Generate historical data for a crypto asset
function generateHistoricalData(basePrice: number, days: number = 365): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let currentPrice = basePrice * 0.7; // Start from 70% of current price
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - i);
    
    // Simulate realistic price movement with trend toward current price
    const trendFactor = (days - i) / days; // 0 to 1
    const targetPrice = basePrice * (0.7 + 0.3 * trendFactor);
    const volatility = basePrice * 0.05; // 5% daily volatility
    
    currentPrice += (targetPrice - currentPrice) * 0.1 + (Math.random() - 0.5) * volatility;
    currentPrice = Math.max(currentPrice, basePrice * 0.1); // Don't go below 10% of current price
    
    data.push({
      timestamp,
      price: currentPrice,
      volume: Math.random() * 1000000000 + 100000000, // Random volume
    });
  }
  
  return data;
}

// Calculate ROC (Rate of Change) for given periods
function calculateROC(historicalData: HistoricalDataPoint[], days: number): number {
  if (historicalData.length < days + 1) return 0;
  
  const currentPrice = historicalData[historicalData.length - 1].price;
  const pastPrice = historicalData[historicalData.length - 1 - days].price;
  
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

export const mockMarketStats: MarketStats = {
  totalMarketCap: 2100000000000,
  volume24h: 89200000000,
  hotMomentum: 47,
  inkChainTVL: 156000000,
  marketCapChange: 2.4,
  volumeChange: 12.1,
  momentumChange: 8,
  tvlChange: 18.6,
};

// Generate base crypto data with historical data and ROC calculations
const baseCryptoData = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 43250.00,
    change24h: 5.2,
    volume24h: 28500000000,
    marketCap: 845000000000,
    momentum: 'hot',
    sparklineData: [40000, 41000, 40500, 42000, 43000, 43250],
    color: '#f7931a',
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 2650.00,
    change24h: 3.8,
    volume24h: 15200000000,
    marketCap: 318000000000,
    momentum: 'active',
    sparklineData: [2500, 2550, 2580, 2620, 2640, 2650],
    color: '#627eea',
  },
  {
    id: '3',
    name: 'Solana',
    symbol: 'SOL',
    price: 98.50,
    change24h: 8.9,
    volume24h: 3400000000,
    marketCap: 43000000000,
    momentum: 'hot',
    sparklineData: [88, 92, 94, 96, 97, 98.5],
    color: '#9945ff',
  },
  {
    id: '4',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.485,
    change24h: 2.3,
    volume24h: 820000000,
    marketCap: 17200000000,
    momentum: 'positive',
    sparklineData: [0.46, 0.47, 0.475, 0.48, 0.483, 0.485],
    color: '#0033ad',
  },
  {
    id: '5',
    name: 'Polygon',
    symbol: 'MATIC',
    price: 0.892,
    change24h: 4.1,
    volume24h: 450000000,
    marketCap: 8300000000,
    momentum: 'active',
    sparklineData: [0.85, 0.86, 0.87, 0.88, 0.89, 0.892],
    color: '#8247e5',
  },
  {
    id: '6',
    name: 'Chainlink',
    symbol: 'LINK',
    price: 15.24,
    change24h: 1.8,
    volume24h: 620000000,
    marketCap: 8900000000,
    momentum: 'moderate',
    sparklineData: [14.8, 15.0, 15.1, 15.15, 15.2, 15.24],
    color: '#375bd2',
  },
  {
    id: '7',
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 36.75,
    change24h: 6.4,
    volume24h: 780000000,
    marketCap: 13500000000,
    momentum: 'active',
    sparklineData: [34, 35, 35.5, 36, 36.5, 36.75],
    color: '#e84142',
  },
  {
    id: '8',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 6.89,
    change24h: -0.5,
    volume24h: 320000000,
    marketCap: 8700000000,
    momentum: 'neutral',
    sparklineData: [7.1, 7.0, 6.95, 6.92, 6.9, 6.89],
    color: '#e6007a',
  },
  {
    id: '9',
    name: 'Uniswap',
    symbol: 'UNI',
    price: 7.25,
    change24h: 3.2,
    volume24h: 180000000,
    marketCap: 4300000000,
    momentum: 'positive',
    sparklineData: [6.9, 7.0, 7.1, 7.15, 7.2, 7.25],
    color: '#ff007a',
  },
  {
    id: '10',
    name: 'Cosmos',
    symbol: 'ATOM',
    price: 12.45,
    change24h: 2.9,
    volume24h: 340000000,
    marketCap: 4800000000,
    momentum: 'positive',
    sparklineData: [11.8, 12.0, 12.1, 12.3, 12.4, 12.45],
    color: '#2e3148',
  },
] as const;

// Generate complete crypto data with historical data and ROC calculations
export const mockCryptoData: CryptoAsset[] = baseCryptoData.map(crypto => {
  const historicalData = generateHistoricalData(crypto.price);
  const roc7d = calculateROC(historicalData, 7);
  const roc30d = calculateROC(historicalData, 30);
  
  return {
    ...crypto,
    historicalData,
    roc7d,
    roc30d,
  };
});

// Get detailed data for a specific crypto
export const getCryptoById = (id: string): CryptoAsset | undefined => {
  return mockCryptoData.find(crypto => crypto.id === id);
};

// Generate technical indicators for a crypto
export const getTechnicalIndicators = (crypto: CryptoAsset): TechnicalIndicator[] => {
  const rsi = 50 + Math.random() * 40; // 50-90 range
  const macd = (Math.random() - 0.5) * 500;
  const ma50 = crypto.price * (0.95 + Math.random() * 0.1);
  const ma200 = crypto.price * (0.85 + Math.random() * 0.2);
  
  return [
    {
      label: 'RSI (14)',
      value: rsi.toFixed(1),
      status: rsi > 70 ? 'bearish' : rsi > 30 ? 'bullish' : 'neutral',
    },
    {
      label: 'MACD',
      value: macd > 0 ? `+${macd.toFixed(1)}` : macd.toFixed(1),
      status: macd > 0 ? 'bullish' : 'bearish',
    },
    {
      label: 'Moving Avg (50)',
      value: `$${ma50.toFixed(2)}`,
      status: crypto.price > ma50 ? 'bullish' : 'bearish',
    },
    {
      label: 'Moving Avg (200)',
      value: `$${ma200.toFixed(2)}`,
      status: crypto.price > ma200 ? 'bullish' : 'bearish',
    },
    {
      label: 'Bollinger Bands',
      value: 'Upper',
      status: 'neutral',
    },
    {
      label: 'Support Level',
      value: `$${(crypto.price * 0.92).toFixed(2)}`,
      status: 'bullish',
    },
  ];
};