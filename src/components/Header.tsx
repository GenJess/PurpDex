import React from 'react';
import { Search, X, TrendingUp } from 'lucide-react';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchValue, onSearchChange, onClearSearch }) => {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-800 gap-6">
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
      
      <div className="relative max-w-md w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search crypto assets..."
          className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
        />
        {searchValue && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;