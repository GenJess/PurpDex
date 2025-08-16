import React from 'react';
import { Wifi, WifiOff, Activity, RotateCcw, Zap } from 'lucide-react';

interface LiveIndicatorProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionType?: 'websocket' | 'polling' | 'simulation';
  reconnectAttempts?: number;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ 
  isConnected, 
  lastUpdate, 
  connectionType = 'simulation',
  reconnectAttempts = 0 
}) => {
  const getStatusColor = () => {
    if (!isConnected) return 'text-red-400 bg-red-500/20 border-red-500/30';
    
    switch (connectionType) {
      case 'websocket':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'polling':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'simulation':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff size={14} />;
    
    switch (connectionType) {
      case 'websocket':
        return <Zap size={14} />;
      case 'polling':
        return <RotateCcw size={14} />;
      case 'simulation':
        return <Activity size={14} />;
      default:
        return <Wifi size={14} />;
    }
  };

  const getStatusText = () => {
    if (!isConnected) {
      return reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts})` : 'Disconnected';
    }
    
    switch (connectionType) {
      case 'websocket':
        return 'Live Stream';
      case 'polling':
        return 'API Polling';
      case 'simulation':
        return 'Demo Mode';
      default:
        return 'Connected';
    }
  };

  const getUpdateFrequency = () => {
    switch (connectionType) {
      case 'websocket':
        return 'Real-time';
      case 'polling':
        return '~10s';
      case 'simulation':
        return '200ms';
      default:
        return '';
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center gap-1.5">
        {getStatusIcon()}
        <span className="text-xs font-medium">
          {getStatusText()}
        </span>
      </div>
      
      {isConnected && (
        <>
          <div className="w-px h-3 bg-current opacity-30" />
          <div className="flex items-center gap-1 text-xs">
            <span className="opacity-75">
              {getUpdateFrequency()}
            </span>
          </div>
        </>
      )}
      
      {lastUpdate && (
        <>
          <div className="w-px h-3 bg-current opacity-30" />
          <span className="text-xs opacity-75">
            {formatLastUpdate(lastUpdate)}
          </span>
        </>
      )}
      
      {/* Animated pulse dot for websocket */}
      {isConnected && connectionType === 'websocket' && (
        <div className="relative">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
};

export default LiveIndicator;
