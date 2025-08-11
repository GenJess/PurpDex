import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import CryptoTable from '../components/CryptoTable';
import { mockMarketStats, mockCryptoData } from '../data/mockData';

const HomePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  const filteredData = useMemo(() => {
    if (!searchValue) return mockCryptoData;
    
    const searchLower = searchValue.toLowerCase();
    return mockCryptoData.filter(crypto => 
      crypto.name.toLowerCase().includes(searchLower) ||
      crypto.symbol.toLowerCase().includes(searchLower)
    );
  }, [searchValue]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Header
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />
      
      <main className="px-6 pb-8">
        <StatsGrid stats={mockMarketStats} />
        <CryptoTable data={filteredData} />
      </main>
    </div>
  );
};

export default HomePage;