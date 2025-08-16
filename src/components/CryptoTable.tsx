import React, { useState } from 'react';
import { BarChart3, Grid, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRealTimePrice } from '../hooks/useRealTimePrice';
import { CryptoAsset, ViewMode, SortField, SortDirection } from '../types/crypto';
import { formatPrice, formatCurrency, formatPercentage, getMomentumColor, getChangeColor } from '../utils/formatters';
import Sparkline from './Sparkline';
import PriceDisplay from './PriceDisplay';
import LiveIndicator from './LiveIndicator';

interface CryptoTableProps {
  data: CryptoAsset[];
}

const CryptoTable: React.FC<CryptoTableProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { prices, isConnected, lastUpdate } = useRealTimePrice(data);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      // Get real-time prices for sorting
      const aPriceData = prices.get(a.id);
      const bPriceData = prices.get(b.id);
      
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = aPriceData?.price || a.price;
          bValue = bPriceData?.price || b.price;
          break;
        case 'change24h':
          aValue = aPriceData?.change24h || a.change24h;
          bValue = bPriceData?.change24h || b.change24h;
          break;
        case 'roc7d':
          aValue = a.roc7d;
          bValue = b.roc7d;
          break;
        case 'roc30d':
          aValue = a.roc30d;
          bValue = b.roc30d;
          break;
        case 'volume24h':
          aValue = aPriceData?.volume24h || a.volume24h;
          bValue = bPriceData?.volume24h || b.volume24h;
          break;
        case 'marketCap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        case 'momentum':
          const momentumOrder = { hot: 4, active: 3, positive: 2, moderate: 1, neutral: 0 };
          aValue = momentumOrder[a.momentum];
          bValue = momentumOrder[b.momentum];
          break;
        default:
          aValue = a.marketCap;
          bValue = b.marketCap;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [data, sortField, sortDirection, prices]);

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = "" 
  }) => (
    <th 
      className={`text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700 cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <ChevronUp 
            size={12} 
            className={`${sortField === field && sortDirection === 'asc' ? 'text-purple-400' : 'text-gray-600'}`} 
          />
          <ChevronDown 
            size={12} 
            className={`${sortField === field && sortDirection === 'desc' ? 'text-purple-400' : 'text-gray-600'} -mt-1`} 
          />
        </div>
      </div>
    </th>
  );

  const getMomentumLabel = (momentum: string): string => {
    return momentum.charAt(0).toUpperCase() + momentum.slice(1);
  };

  if (viewMode === 'cards') {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/30 gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Live Momentum</h2>
            <LiveIndicator isConnected={isConnected} lastUpdate={lastUpdate} />
          </div>
          <div className="flex gap-1 bg-gray-700/50 p-1 rounded-xl border border-gray-600">
            <button
              onClick={() => setViewMode('table')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all"
            >
              <BarChart3 size={16} />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white shadow-lg shadow-purple-500/30 transform scale-105 transition-all"
            >
              <Grid size={16} />
              Cards
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {sortedData.map((crypto) => {
            const priceData = prices.get(crypto.id);
            const currentPrice = priceData?.price || crypto.price;
            const currentChange = priceData?.change24h || crypto.change24h;
            const currentVolume = priceData?.volume24h || crypto.volume24h;
            
            return (
            <Link key={crypto.id} to={`/coin/${crypto.id}`}>
              <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm relative overflow-hidden"
                    style={{ backgroundColor: crypto.color }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse transform -skew-x-12" />
                    {crypto.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{crypto.name}</div>
                    <div className="text-sm text-gray-400">{crypto.symbol}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getMomentumColor(crypto.momentum)}`}>
                  {getMomentumLabel(crypto.momentum)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="mb-1">
                    <PriceDisplay 
                      price={currentPrice}
                      previousPrice={crypto.price}
                      change24h={currentChange}
                      size="lg"
                      showChange={false}
                    />
                  </div>
                  <div className="text-xs text-gray-400">Price</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold mb-1 ${currentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(currentChange)}
                  </div>
                  <div className="text-xs text-gray-400">24h Change</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-lg font-bold mb-1 ${crypto.roc7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(crypto.roc7d)}
                  </div>
                  <div className="text-xs text-gray-400">7d ROC</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold mb-1 ${crypto.roc30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(crypto.roc30d)}
                  </div>
                  <div className="text-xs text-gray-400">30d ROC</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white font-mono mb-1">
                    {formatCurrency(currentVolume)}
                  </div>
                  <div className="text-xs text-gray-400">Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white font-mono mb-1">
                    {formatCurrency(crypto.marketCap)}
                  </div>
                  <div className="text-xs text-gray-400">Market Cap</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Sparkline
                  data={crypto.sparklineData}
                  width={80}
                  height={30}
                  color={currentChange >= 0 ? '#10B981' : '#EF4444'}
                />
              </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/30 gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Live Momentum</h2>
          <LiveIndicator isConnected={isConnected} lastUpdate={lastUpdate} />
        </div>
        <div className="flex gap-1 bg-gray-700/50 p-1 rounded-xl border border-gray-600">
          <button
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white shadow-lg shadow-purple-500/30 transform scale-105 transition-all"
          >
            <BarChart3 size={16} />
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all"
          >
            <Grid size={16} />
            Cards
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-700/30">
              <SortableHeader field="name" className="w-48">Asset</SortableHeader>
              <SortableHeader field="price" className="w-32">Price</SortableHeader>
              <SortableHeader field="change24h" className="w-28">24h Change</SortableHeader>
              <SortableHeader field="roc7d" className="w-24">7d ROC</SortableHeader>
              <SortableHeader field="roc30d" className="w-24">30d ROC</SortableHeader>
              <SortableHeader field="volume24h" className="w-28">Volume (24h)</SortableHeader>
              <SortableHeader field="marketCap" className="w-28">Market Cap</SortableHeader>
              <SortableHeader field="momentum" className="w-24">Momentum</SortableHeader>
              <th className="w-20 text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">7d Chart</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((crypto) => {
              const priceData = prices.get(crypto.id);
              const currentPrice = priceData?.price || crypto.price;
              const currentChange = priceData?.change24h || crypto.change24h;
              const currentVolume = priceData?.volume24h || crypto.volume24h;
              
              return (
              <Link key={crypto.id} to={`/coin/${crypto.id}`} className="contents">
                <tr className="hover:bg-gray-700/30 transition-colors border-b border-gray-800/30 last:border-b-0 cursor-pointer">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm relative overflow-hidden"
                      style={{ backgroundColor: crypto.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse transform -skew-x-12" />
                      {crypto.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {crypto.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {crypto.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <PriceDisplay 
                    price={currentPrice}
                    previousPrice={crypto.price}
                    change24h={currentChange}
                    showChange={false}
                  />
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getChangeColor(currentChange)}`}>
                    {currentChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {formatPercentage(currentChange)}
                  </div>
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getChangeColor(crypto.roc7d)}`}>
                    {crypto.roc7d >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {formatPercentage(crypto.roc7d)}
                  </div>
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getChangeColor(crypto.roc30d)}`}>
                    {crypto.roc30d >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {formatPercentage(crypto.roc30d)}
                  </div>
                </td>
                <td className="p-6 font-mono text-white text-sm">
                  {formatCurrency(currentVolume)}
                </td>
                <td className="p-6 font-mono text-white text-sm">
                  {formatCurrency(crypto.marketCap)}
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase ${getMomentumColor(crypto.momentum)}`}>
                    {getMomentumLabel(crypto.momentum)}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-center">
                    <Sparkline
                      data={crypto.sparklineData}
                      width={60}
                      height={20}
                      color={currentChange >= 0 ? '#10B981' : '#EF4444'}
                    />
                  </div>
                </td>
                </tr>
              </Link>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTable;