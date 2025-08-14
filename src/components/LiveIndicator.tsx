import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface LiveIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date | null;
  size?: 'sm' | 'md';
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ 
  isConnected, 
  lastUpdate, 
  size = 'sm' 
}) => {
  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 1) return 'now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const iconSize = size === 'sm' ? 12 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`inline-flex items-center gap-2 ${textSize} font-medium`}>
      {isConnected ? (
        <>
          <div className="relative">
            <Wifi size={iconSize} className="text-green-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <span className="text-green-400">
            LIVE {lastUpdate && `• ${getTimeSinceUpdate()}`}
          </span>
        </>
      ) : (
        <>
          <WifiOff size={iconSize} className="text-red-400" />
          <span className="text-red-400">OFFLINE</span>
        </>
      )}
    </div>
  );
};

export default LiveIndicator;