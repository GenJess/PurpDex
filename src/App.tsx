import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CryptoDetailsPage from './pages/CryptoDetailsPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coin/:id" element={<CryptoDetailsPage />} />
      </Routes>
    </div>
  );
}

export default App;