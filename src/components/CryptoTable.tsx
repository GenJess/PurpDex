import React, { useState, useMemo, useCallback, useRef } from 'react';
import { BarChart3, Grid, TrendingUp, TrendingDown, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
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

// Column configuration for reordering
interface ColumnConfig {
  field: SortField | 'chart';
  label: string;
  width: string;
  sortable: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { field: 'name', label: 'Asset', width: 'w-48', sortable: true },
  { field: 'price', label: 'Price', width: 'w-32', sortable: true },
  { field: 'change24h', label: '24h Change', width: 'w-28', sortable: true },
  { field: 'roc7d', label: '7d ROC', width: 'w-28', sortable: true },
  { field: 'roc30d', label: '30d ROC', width: 'w-28', sortable: true },
  { field: 'volume24h', label: 'Volume (24h)', width: 'w-32', sortable: true },
  { field: 'marketCap', label: 'Market Cap', width: 'w-32', sortable: true },
  { field: 'momentum', label: 'Momentum', width: 'w-28', sortable: true },
  { field: 'chart', label: '7d Chart', width: 'w-24', sortable: false },
];

// Smooth number display with drop shadow
const SmoothNumber: React.FC<{
  value: string;
  isPositive?: boolean;
  isNegative?: boolean;
  className?: string;
}> = ({ value, isPositive, isNegative, className = "" }) => {
  const shadowColor = isPositive ? 'rgba(16, 185, 129, 0.3)' : 
                     isNegative ? 'rgba(239, 68, 68, 0.3)' : 
                     'rgba(255, 255, 255, 0.1)';
  
  return (
    <span 
      className={`transition-all duration-500 ease-out ${className}`}
      style={{
        textShadow: `0 1px 3px ${shadowColor}`,
        filter: 'brightness(1.05)'
      }}
    >
      {value}
    </span>
  );
};

// Smooth price display component
const SmoothPriceDisplay: React.FC<{
  price: number;
  previousPrice: number;
  change24h: number;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ price, previousPrice, change24h, showChange = true, size = 'md' }) => {
  const isPositive = change24h > 0;
  const isNegative = change24h < 0;
  
  return (
    <div className="transition-all duration-500 ease-out">
      <SmoothNumber 
        value={formatPrice(price)}
        isPositive={isPositive}
        isNegative={isNegative}
        className="font-mono text-white"
      />
    </div>
  );
};

// Smooth percentage display with fixed width and drop shadow
const SmoothPercentage: React.FC<{
  value: number;
  showIcon?: boolean;
  className?: string;
}> = ({ value, showIcon = true, className = "" }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <div className={`transition-colors duration-300 ease-out inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold min-w-[80px] ${getChangeColor(value)} ${className}`}>
      {showIcon && (value >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
      <SmoothNumber 
        value={formatPercentage(value)}
        isPositive={isPositive}
        isNegative={isNegative}
        className="font-mono"
      />
    </div>
  );
};

const CryptoTable: React.FC<CryptoTableProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const { prices, isConnected, lastUpdate, connectionType, reconnectAttempts } = useRealTimePrice(data);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  // Column drag and drop handlers
  const handleColumnDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedColumn(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleColumnDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverColumn(index);
  }, []);

  const handleColumnDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumn !== null && draggedColumn !== dropIndex) {
      const newColumns = [...columns];
      const draggedItem = newColumns[draggedColumn];
      newColumns.splice(draggedColumn, 1);
      newColumns.splice(dropIndex, 0, draggedItem);
      setColumns(newColumns);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, [draggedColumn, columns]);

  const handleColumnDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Memoize sorted data to prevent unnecessary recalculations
  const sortedData = useMemo(() => {
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

  const SortableHeader: React.FC<{ 
    column: ColumnConfig;
    index: number;
    className?: string 
  }> = ({ column, index, className = "" }) => (
    <th 
      draggable
      onDragStart={(e) => handleColumnDragStart(e, index)}
      onDragOver={(e) => handleColumnDragOver(e, index)}
      onDrop={(e) => handleColumnDrop(e, index)}
      onDragEnd={handleColumnDragEnd}
      className={`group text-left p-6 text-sm font-semibold text-gray-300 border-b border-gray-700 cursor-pointer hover:text-white transition-colors duration-200 ${
        draggedColumn === index ? 'opacity-50' : ''
      } ${
        dragOverColumn === index ? 'bg-purple-500/20' : ''
      } ${className}`}
      onClick={() => column.sortable && handleSort(column.field as SortField)}
    >
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
        {column.label}
        {column.sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              size={12} 
              className={`transition-colors duration-200 ${
                sortField === column.field && sortDirection === 'asc' ? 'text-purple-400' : 'text-gray-600'
              }`} 
            />
            <ChevronDown 
              size={12} 
              className={`transition-colors duration-200 ${
                sortField === column.field && sortDirection === 'desc' ? 'text-purple-400' : 'text-gray-600'
              } -mt-1`} 
            />
          </div>
        )}
      </div>
    </th>
  );

  const getMomentumLabel = (momentum: string): string => {
    return momentum.charAt(0).toUpperCase() + momentum.slice(1);
  };

  // Memoized card component to prevent unnecessary re-renders
  const CryptoCard = React.memo(({ crypto }: { crypto: CryptoAsset }) => {
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm relative overflow-hidden transition-all duration-300"
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
            <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition-all duration-300 ${getMomentumColor(crypto.momentum)}`}>
              {getMomentumLabel(crypto.momentum)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="mb-1">
                <SmoothNumber 
                  value={formatPrice(currentPrice)}
                  isPositive={currentChange > 0}
                  isNegative={currentChange < 0}
                  className="text-lg font-bold text-white font-mono"
                />
              </div>
              <div className="text-xs text-gray-400">Price</div>
            </div>
            <div className="text-center">
              <div className="mb-1">
                <SmoothPercentage value={currentChange} showIcon={false} className="text-lg font-bold px-0 min-w-[90px]" />
              </div>
              <div className="text-xs text-gray-400">24h Change</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="mb-1">
                <SmoothPercentage value={crypto.roc7d} showIcon={false} className="text-lg font-bold px-0 min-w-[90px]" />
              </div>
              <div className="text-xs text-gray-400">7d ROC</div>
            </div>
            <div className="text-center">
              <div className="mb-1">
                <SmoothPercentage value={crypto.roc30d} showIcon={false} className="text-lg font-bold px-0 min-w-[90px]" />
              </div>
              <div className="text-xs text-gray-400">30d ROC</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono mb-1 transition-all duration-500">
                <SmoothNumber 
                  value={formatCurrency(currentVolume)}
                  className="text-white"
                />
              </div>
              <div className="text-xs text-gray-400">Volume</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono mb-1 transition-all duration-500">
                <SmoothNumber 
                  value={formatCurrency(crypto.marketCap)}
                  className="text-white"
                />
              </div>
              <div className="text-xs text-gray-400">Market Cap</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="transition-all duration-300">
              <Sparkline
                data={crypto.sparklineData}
                width={80}
                height={30}
                color={currentChange >= 0 ? '#10B981' : '#EF4444'}
              />
            </div>
          </div>
        </div>
      </Link>
    );
  });

  // Render cell content based on column field
  const renderCellContent = (crypto: CryptoAsset, column: ColumnConfig) => {
    const priceData = prices.get(crypto.id);
    const currentPrice = priceData?.price || crypto.price;
    const currentChange = priceData?.change24h || crypto.change24h;
    const currentVolume = priceData?.volume24h || crypto.volume24h;

    switch (column.field) {
      case 'name':
        return (
          <div className="flex items-center gap-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm relative overflow-hidden transition-all duration-300"
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
        );
      case 'price':
        return <SmoothPriceDisplay 
          price={currentPrice}
          previousPrice={crypto.price}
          change24h={currentChange}
          showChange={false}
        />;
      case 'change24h':
        return <SmoothPercentage value={currentChange} />;
      case 'roc7d':
        return <SmoothPercentage value={crypto.roc7d} />;
      case 'roc30d':
        return <SmoothPercentage value={crypto.roc30d} />;
      case 'volume24h':
        return (
          <SmoothNumber 
            value={formatCurrency(currentVolume)}
            className="font-mono text-white text-sm"
          />
        );
      case 'marketCap':
        return (
          <SmoothNumber 
            value={formatCurrency(crypto.marketCap)}
            className="font-mono text-white text-sm"
          />
        );
      case 'momentum':
        return (
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase transition-all duration-300 ${getMomentumColor(crypto.momentum)}`}>
            {getMomentumLabel(crypto.momentum)}
          </div>
        );
      case 'chart':
        return (
          <div className="flex justify-center">
            <div className="transition-all duration-300">
              <Sparkline
                data={crypto.sparklineData}
                width={60}
                height={20}
                color={currentChange >= 0 ? '#10B981' : '#EF4444'}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Memoized table row component
  const CryptoRow = React.memo(({ crypto }: { crypto: CryptoAsset }) => (
    <Link key={crypto.id} to={`/coin/${crypto.id}`} className="contents">
      <tr className="hover:bg-gray-700/30 transition-colors duration-200 border-b border-gray-800/30 last:border-b-0 cursor-pointer">
        {columns.map((column) => (
          <td key={column.field} className="p-6">
            {renderCellContent(crypto, column)}
          </td>
        ))}
      </tr>
    </Link>
  ));

  if (viewMode === 'cards') {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/30 gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Live Momentum</h2>
            <LiveIndicator 
              isConnected={isConnected} 
              lastUpdate={lastUpdate} 
              connectionType={connectionType}
              reconnectAttempts={reconnectAttempts}
            />
          </div>
          <div className="flex gap-1 bg-gray-700/50 p-1 rounded-xl border border-gray-600">
            <button
              onClick={() => setViewMode('table')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all duration-200"
            >
              <BarChart3 size={16} />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white shadow-lg shadow-purple-500/30 transform scale-105 transition-all duration-200"
            >
              <Grid size={16} />
              Cards
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {sortedData.map((crypto) => (
            <CryptoCard key={crypto.id} crypto={crypto} />
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
                      <LiveIndicator 
              isConnected={isConnected} 
              lastUpdate={lastUpdate} 
              connectionType={connectionType}
              reconnectAttempts={reconnectAttempts}
            />
        </div>
        <div className="flex gap-1 bg-gray-700/50 p-1 rounded-xl border border-gray-600">
          <button
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white shadow-lg shadow-purple-500/30 transform scale-105 transition-all duration-200"
          >
            <BarChart3 size={16} />
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all duration-200"
          >
            <Grid size={16} />
            Cards
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            {columns.map((column) => (
              <col key={column.field} className={column.width} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gray-700/30">
              {columns.map((column, index) => (
                <SortableHeader key={column.field} column={column} index={index} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((crypto) => (
              <CryptoRow key={crypto.id} crypto={crypto} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTable;