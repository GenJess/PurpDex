import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Star, BarChart3, Zap, Shield, Clock, Target, Activity } from 'lucide-react';
import { useRealTimePrice } from '../hooks/useRealTimePrice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { getCryptoById, getTechnicalIndicators } from '../data/mockData';
import { formatPrice, formatCurrency, formatPercentage } from '../utils/formatters';
import { CryptoAsset, TechnicalIndicator } from '../types/crypto';
import PriceDisplay from '../components/PriceDisplay';
import LiveIndicator from '../components/LiveIndicator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

type Timeframe = '1h' | '4h' | '1d' | '1w' | '1m' | '1y';

const CryptoDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crypto, setCrypto] = useState<CryptoAsset | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1d');
  const [chartData, setChartData] = useState<any>(null);
  
  // Real-time price hook
  const { prices, isConnected, lastUpdate } = useRealTimePrice(crypto ? [crypto] : []);

  useEffect(() => {
    if (id) {
      const cryptoData = getCryptoById(id);
      if (cryptoData) {
        setCrypto(cryptoData);
        setTechnicalIndicators(getTechnicalIndicators(cryptoData));
      }
    }
  }, [id]);

  // Update chart data when crypto or timeframe changes
  useEffect(() => {
    if (crypto) {
      setChartData(generateChartData(activeTimeframe));
    }
  }, [crypto, activeTimeframe]);

  if (!crypto) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading crypto details...</p>
          </div>
        </div>
      </div>
    );
  }

  const generateChartData = (timeframe: Timeframe) => {
    const dataPoints = timeframe === '1h' ? 60 : timeframe === '1d' ? 100 : timeframe === '1w' ? 168 : 365;
    const data = crypto.historicalData.slice(-dataPoints);
    
    // Get current real-time price
    const currentPriceData = prices.get(crypto.id);
    const currentPrice = currentPriceData?.price || crypto.price;
    const priceChange = currentPriceData?.change24h || crypto.change24h;
    
    return {
      labels: data.map(point => point.timestamp),
      datasets: [
        {
          label: `${crypto.symbol} Price`,
          data: [...data.map(point => point.price), currentPrice], // Add current price as latest point
          borderColor: priceChange >= 0 ? '#00ff88' : '#ff007f',
          backgroundColor: priceChange >= 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 127, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: priceChange >= 0 ? '#00ff88' : '#ff007f',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        },
      ],
    };
  };

  // Get current real-time data
  const currentPriceData = prices.get(crypto?.id || '');
  const currentPrice = currentPriceData?.price || crypto?.price || 0;
  const currentChange = currentPriceData?.change24h || crypto?.change24h || 0;
  const currentVolume = currentPriceData?.volume24h || crypto?.volume24h || 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#21222d',
        titleColor: '#f8f8f2',
        bodyColor: '#f8f8f2',
        borderColor: '#3a3d4a',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          },
          title: function(context: any) {
            return new Date(context[0].label).toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: activeTimeframe === '1h' ? 'minute' : activeTimeframe === '1d' ? 'hour' : 'day',
        },
        grid: {
          color: 'rgba(58, 61, 74, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#a3a3a3',
          maxTicksLimit: 8,
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(58, 61, 74, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#a3a3a3',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const getMomentumBadgeClass = (momentum: string) => {
    switch (momentum) {
      case 'hot':
        return 'bg-pink-400/15 text-pink-400 border border-pink-400/30';
      case 'active':
        return 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30';
      case 'positive':
        return 'bg-green-400/15 text-green-400 border border-green-400/30';
      case 'moderate':
        return 'bg-amber-400/15 text-amber-400 border border-amber-400/30';
      default:
        return 'bg-gray-400/15 text-gray-400 border border-gray-400/30';
    }
  };

  const getIndicatorStatusClass = (status: string) => {
    switch (status) {
      case 'bullish':
        return 'bg-green-400/15 text-green-400 border border-green-400/30';
      case 'bearish':
        return 'bg-pink-400/15 text-pink-400 border border-pink-400/30';
      default:
        return 'bg-amber-400/15 text-amber-400 border border-amber-400/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse transform -skew-x-12" />
            <TrendingUp className="w-7 h-7 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              PurpDex
            </h1>
            <p className="text-sm text-gray-400">Crypto Momentum Tracker • Ink Chain</p>
          </div>
        </div>
        
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
        >
          <ArrowLeft size={16} />
          Back to Markets
        </Link>
      </header>

      {/* Coin Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 p-8 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl">
        <div className="flex items-center gap-6 mb-6 lg:mb-0">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl relative overflow-hidden shadow-lg"
            style={{ backgroundColor: crypto.color, boxShadow: `0 0 24px ${crypto.color}40` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse transform -skew-x-12" />
            {crypto.symbol.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">{crypto.name}</h1>
            <p className="text-lg text-gray-400 font-medium">{crypto.symbol}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold uppercase mt-3 ${getMomentumBadgeClass(crypto.momentum)}`}>
              {crypto.momentum === 'hot' && '🔥'} {crypto.momentum.charAt(0).toUpperCase() + crypto.momentum.slice(1)} Momentum
            </div>
          </div>
        </div>
        
        <div className="text-center lg:text-right">
          <div className="mb-2">
            <PriceDisplay 
              price={currentPrice}
              previousPrice={crypto.price}
              change24h={currentChange}
              size="xl"
              showChange={false}
            />
          </div>
          <div className={`flex items-center gap-2 justify-center lg:justify-end text-xl font-semibold ${currentChange >= 0 ? 'text-green-400' : 'text-pink-400'}`}>
            {currentChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {formatPercentage(currentChange)}
          </div>
          <div className="flex items-center gap-2 justify-center lg:justify-end mt-2">
            <LiveIndicator isConnected={isConnected} lastUpdate={lastUpdate} size="md" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-semibold text-white">Price Chart</h2>
            <div className="flex gap-1 bg-gray-700/50 p-1 rounded-xl border border-gray-600">
              {(['1h', '4h', '1d', '1w', '1m', '1y'] as Timeframe[]).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTimeframe === timeframe
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  {timeframe.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="h-96">
            {chartData && <Line data={chartData} options={chartOptions} />}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Key Statistics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Market Cap', value: formatCurrency(crypto.marketCap) },
                { label: '24h Volume', value: formatCurrency(currentVolume) },
                { label: '7d ROC', value: formatPercentage(crypto.roc7d), color: crypto.roc7d >= 0 ? 'text-green-400' : 'text-pink-400' },
                { label: '30d ROC', value: formatPercentage(crypto.roc30d), color: crypto.roc30d >= 0 ? 'text-green-400' : 'text-pink-400' },
                { label: 'Market Cap Rank', value: `#${crypto.id}` },
              ].map((stat, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700/30 last:border-b-0">
                  <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                  <span className={`text-sm font-semibold font-mono ${stat.color || 'text-white'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Price Performance
            </h3>
            <div className="space-y-4">
              {[
                { label: '24h High', value: formatPrice(currentPrice * 1.05) },
                { label: '24h Low', value: formatPrice(currentPrice * 0.95) },
                { label: '7d Change', value: formatPercentage(crypto.roc7d), color: crypto.roc7d >= 0 ? 'text-green-400' : 'text-pink-400' },
                { label: '30d Change', value: formatPercentage(crypto.roc30d), color: crypto.roc30d >= 0 ? 'text-green-400' : 'text-pink-400' },
                { label: 'All-Time High', value: formatPrice(currentPrice * 1.6) },
              ].map((stat, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700/30 last:border-b-0">
                  <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                  <span className={`text-sm font-semibold font-mono ${stat.color || 'text-white'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Trading Volume', value: formatCurrency(currentVolume), subtitle: '24h Volume • +12.1%', icon: Zap, color: 'cyan' },
          { title: 'Fear & Greed Index', value: '73', subtitle: 'Greed • Market Sentiment', icon: Clock, color: 'amber' },
          { title: 'Market Dominance', value: '52.3%', subtitle: `${crypto.symbol} Market Share`, icon: Shield, color: 'purple' },
          { title: 'Volatility Index', value: '2.8%', subtitle: '7-Day Volatility', icon: Activity, color: 'pink' },
        ].map((card, index) => (
          <div key={index} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-white">{card.title}</span>
              <div className={`p-2 rounded-xl bg-${card.color}-400/20`}>
                <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white font-mono mb-2">{card.value}</div>
            <div className="text-sm text-gray-400">{card.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Technical Indicators */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-400" />
          Technical Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicalIndicators.map((indicator, index) => (
            <div key={index} className="text-center p-6 bg-gray-700/30 border border-gray-600 rounded-2xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">
                {indicator.label}
              </div>
              <div className="text-2xl font-bold text-white mb-3 font-mono">
                {indicator.value}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${getIndicatorStatusClass(indicator.status)}`}>
                {indicator.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailsPage;