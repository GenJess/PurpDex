export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  momentum: 'hot' | 'active' | 'positive' | 'moderate' | 'neutral';
  sparklineData: number[];
  color: string;
}

export interface MarketStats {
  totalMarketCap: number;
  volume24h: number;
  hotMomentum: number;
  inkChainTVL: number;
  marketCapChange: number;
  volumeChange: number;
  momentumChange: number;
  tvlChange: number;
}

export type ViewMode = 'table' | 'cards';