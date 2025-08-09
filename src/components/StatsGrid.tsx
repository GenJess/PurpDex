import React from 'react';
import { TrendingUp, Zap, Star, Shield } from 'lucide-react';
import { MarketStats } from '../types/crypto';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface StatsGridProps {
  stats: MarketStats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Market Cap',
      value: formatCurrency(stats.totalMarketCap),
      fullValue: `($${stats.totalMarketCap.toLocaleString()})`,
      change: stats.marketCapChange,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'purple',
    },
    {
      title: '24h Volume',
      value: formatCurrency(stats.volume24h),
      fullValue: `($${stats.volume24h.toLocaleString()})`,
      change: stats.volumeChange,
      icon: <Zap className="w-5 h-5" />,
      color: 'cyan',
      highlight: true,
    },
    {
      title: 'Hot Momentum',
      value: stats.hotMomentum.toString(),
      change: stats.momentumChange,
      icon: <Star className="w-5 h-5" />,
      color: 'pink',
      suffix: 'assets',
    },
    {
      title: 'Ink Chain TVL',
      value: formatCurrency(stats.inkChainTVL),
      fullValue: `($${stats.inkChainTVL.toLocaleString()})`,
      change: stats.tvlChange,
      icon: <Shield className="w-5 h-5" />,
      color: 'green',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'text-purple-400 bg-purple-400/20';
      case 'cyan':
        return 'text-cyan-400 bg-cyan-400/20';
      case 'pink':
        return 'text-pink-400 bg-pink-400/20';
      case 'green':
        return 'text-green-400 bg-green-400/20';
      default:
        return 'text-purple-400 bg-purple-400/20';
    }
  };

  const getChangeColorClasses = (change: number) => {
    if (change > 5) return 'text-pink-400 bg-pink-400/10 border border-pink-400/20';
    if (change > 0) return 'text-green-400 bg-green-400/10 border border-green-400/20';
    return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="relative bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:border-purple-500/30 group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-medium">{card.title}</span>
            <div className={`p-2 rounded-xl ${getColorClasses(card.color)}`}>
              {card.icon}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-2xl font-bold text-white font-mono">
              {card.value}
              {card.suffix && <span className="text-sm text-gray-400 font-normal ml-2">{card.suffix}</span>}
            </div>
            {card.fullValue && (
              <div className="text-sm text-gray-500 mt-1">{card.fullValue}</div>
            )}
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getChangeColorClasses(card.change)}`}>
            <TrendingUp size={10} />
            {formatPercentage(card.change)}
            {card.highlight && ' 🔥'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;