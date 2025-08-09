import React, { useState } from 'react';
import { BarChart3, Grid, TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoAsset, ViewMode } from '../types/crypto';
import { formatPrice, formatCurrency, formatPercentage, getMomentumColor, getChangeColor } from '../utils/formatters';
import Sparkline from './Sparkline';

interface CryptoTableProps {
  data: CryptoAsset[];
}

const CryptoTable: React.FC<CryptoTableProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const getMomentumLabel = (momentum: string): string => {
    return momentum.charAt(0).toUpperCase() + momentum.slice(1);
  };

  const LiveIndicator = () => (
    <div className="inline-flex items-center gap-2 text-green-400 text-xs font-medium">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      LIVE
    </div>
  );

  if (viewMode === 'cards') {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/30 gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Live Momentum</h2>
            <LiveIndicator />
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
          {data.map((crypto) => (
            <div
              key={crypto.id}
              className="bg-gray-700/30 border border-gray-600 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300"
            >
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
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white font-mono mb-1">
                    {formatPrice(crypto.price)}
                  </div>
                  <div className="text-xs text-gray-400">Price</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold mb-1 ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(crypto.change24h)}
                  </div>
                  <div className="text-xs text-gray-400">24h Change</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white font-mono mb-1">
                    {formatCurrency(crypto.volume24h)}
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
                  color={crypto.change24h >= 0 ? '#10B981' : '#EF4444'}
                />
              </div>
            </div>
          ))}
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
          <LiveIndicator />
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
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/30">
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                Asset
              </th>
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                Price
              </th>
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                24h Change
              </th>
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                Volume (24h)
              </th>
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                Market Cap
              </th>
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                Momentum
              </th>
              <th className="text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700">
                7d Chart
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((crypto) => (
              <tr
                key={crypto.id}
                className="hover:bg-gray-700/30 transition-colors border-b border-gray-800/30 last:border-b-0"
              >
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
                <td className="p-6 font-mono font-semibold text-white text-sm">
                  {formatPrice(crypto.price)}
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getChangeColor(crypto.change24h)}`}>
                    {crypto.change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {formatPercentage(crypto.change24h)}
                  </div>
                </td>
                <td className="p-6 font-mono text-white text-sm">
                  {formatCurrency(crypto.volume24h)}
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
                      color={crypto.change24h >= 0 ? '#10B981' : '#EF4444'}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTable;