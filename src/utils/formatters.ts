export const formatCurrency = (value: number): string => {
  if (value >= 1000000000000) {
    return `$${(value / 1000000000000).toFixed(2)}T`;
  }
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const formatPrice = (value: number): string => {
  if (value >= 1000) {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
  return `$${value.toFixed(3)}`;
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getMomentumColor = (momentum: string): string => {
  switch (momentum) {
    case 'hot':
      return 'text-pink-400 bg-pink-400/10 border border-pink-400/20';
    case 'active':
      return 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20';
    case 'positive':
      return 'text-green-400 bg-green-400/10 border border-green-400/20';
    case 'moderate':
      return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border border-gray-400/20';
  }
};

export const getChangeColor = (value: number): string => {
  if (value > 5) return 'text-pink-400 bg-pink-400/10 border border-pink-400/20';
  if (value > 0) return 'text-green-400 bg-green-400/10 border border-green-400/20';
  if (value > -5) return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
  return 'text-red-400 bg-red-400/10 border border-red-400/20';
};