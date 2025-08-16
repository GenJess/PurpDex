import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoAsset } from '../types/crypto';
import { useRealTimePrice } from '../hooks/useRealTimePrice';
import LiveIndicator from './LiveIndicator';

interface CryptoTableProps {
  data: CryptoAsset[];
}

type SortField = 'rank' | 'name' | 'price' | 'change24h' | 'marketCap' | 'volume24h';
type SortDirection = 'asc' | 'desc';

const CryptoTable: React.FC<CryptoTableProps> = ({ data }) => {
  // Real-time price data with enhanced status
  const { prices, isConnected, lastUpdate, connectionType, reconnectAttempts } = useRealTimePrice(data);
  
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Get current price for a crypto asset
  const getCurrentPrice = (crypto: CryptoAsset) => {
    const realtimePrice = prices.get(crypto.id);
    return realtimePrice || {
      id: crypto.id,
      price: crypto.price,
      change24h: crypto.change24h,
      volume24h: crypto.volume24h,
      timestamp: new Date(),
    };
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    let filtered = data.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aPrice = getCurrentPrice(a);
      const bPrice = getCurrentPrice(b);
      
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'price':
          aValue = aPrice.price;
          bValue = bPrice.price;
          break;
        case 'change24h':
          aValue = aPrice.change24h;
          bValue = bPrice.change24h;
          break;
        case 'marketCap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        case 'volume24h':
          aValue = aPrice.volume24h;
          bValue = bPrice.volume24h;
          break;
        default:
          aValue = a.rank;
          bValue = b.rank;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, searchTerm, sortField, sortDirection, prices]);

  // Format functions
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toLocaleString()}`;
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4" />;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header with Search and Live Indicator */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Cryptocurrency Prices</h2>
            <LiveIndicator 
              isConnected={isConnected} 
              lastUpdate={lastUpdate} 
              connectionType={connectionType}
              reconnectAttempts={reconnectAttempts}
            />
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Rank
                  <SortIcon field="rank" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Price
                  <SortIcon field="price" />
                </div>
              </th>
              <th
                onClick={() => handleSort('change24h')}
                className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  24h Change
                  <SortIcon field="change24h" />
                </div>
              </th>
              <th
                onClick={() => handleSort('marketCap')}
                className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Market Cap
                  <SortIcon field="marketCap" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volume24h')}
                className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  24h Volume
                  <SortIcon field="volume24h" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedAndFilteredData.map((crypto) => {
              const currentPrice = getCurrentPrice(crypto);
              return (
                <tr key={crypto.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {crypto.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{crypto.name}</div>
                        <div className="text-sm text-gray-400">{crypto.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {formatPrice(currentPrice.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatChange(currentPrice.change24h)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatMarketCap(crypto.marketCap)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatVolume(currentPrice.volume24h)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
