import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  change24h: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChange?: boolean;
  animated?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  previousPrice,
  change24h,
  size = 'md',
  showChange = true,
  animated = true,
}) => {
  const [displayPrice, setDisplayPrice] = useState(price);
  const [isFlashing, setIsFlashing] = useState(false);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  // Smooth price animation
  useEffect(() => {
    if (!animated) {
      setDisplayPrice(price);
      return;
    }

    const startPrice = displayPrice;
    const endPrice = price;
    const duration = 150; // 150ms animation
    const startTime = Date.now();

    // Determine price direction
    if (previousPrice !== undefined) {
      if (price > previousPrice) {
        setPriceDirection('up');
        setIsFlashing(true);
      } else if (price < previousPrice) {
        setPriceDirection('down');
        setIsFlashing(true);
      }
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPrice = startPrice + (endPrice - startPrice) * easeOut;
      
      setDisplayPrice(currentPrice);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Clear flash effect
    const flashTimeout = setTimeout(() => {
      setIsFlashing(false);
    }, 200);

    return () => clearTimeout(flashTimeout);
  }, [price, previousPrice, displayPrice, animated]);

  const formatPrice = (value: number): string => {
    if (value >= 1000) {
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    return `$${value.toFixed(3)}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-2xl';
      default:
        return 'text-base';
    }
  };

  const getFlashClasses = () => {
    if (!isFlashing) return '';
    
    switch (priceDirection) {
      case 'up':
        return 'animate-pulse bg-green-400/20 rounded-md px-1';
      case 'down':
        return 'animate-pulse bg-red-400/20 rounded-md px-1';
      default:
        return '';
    }
  };

  const getChangeColor = () => {
    if (change24h > 5) return 'text-pink-400';
    if (change24h > 0) return 'text-green-400';
    if (change24h > -5) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span 
        className={`font-mono font-semibold text-white transition-all duration-150 ${getSizeClasses()} ${getFlashClasses()} w-24 text-right truncate`}
      >
        {formatPrice(displayPrice)}
      </span>
      
      {showChange && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${getChangeColor()} w-20 justify-end`}>
          {change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="truncate">{formatPercentage(change24h)}</span>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;