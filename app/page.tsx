'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductTable from '@/components/ProductTable';
import StatsSidebar from '@/components/StatsSidebar';
import Footer from '@/components/Footer';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const triggerStatsRefresh = () => {
    setStatsRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onCategoryChange={triggerStatsRefresh}
        />
        <main className="flex-1 overflow-hidden bg-gray-50/50 min-w-0">
          <ProductTable 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery}
            onProductChange={triggerStatsRefresh}
          />
        </main>
        <StatsSidebar refreshTrigger={statsRefreshTrigger} />
      </div>
      <Footer />
    </div>
  );
}
