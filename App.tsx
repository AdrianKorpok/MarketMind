import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockDashboard from './components/StockDashboard';
import { analyzeStock } from './services/geminiService';
import { SearchState } from './types';
import { Activity, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const handleSearch = async (symbol: string) => {
    setSearchState({ isLoading: true, error: null, data: null });
    try {
      const data = await analyzeStock(symbol);
      setSearchState({ isLoading: false, error: null, data });
    } catch (err: any) {
      console.error(err);
      // Display the actual error message
      setSearchState({ 
        isLoading: false, 
        error: err.message || "Failed to analyze stock. Please check the symbol or try again later.", 
        data: null 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
            {!searchState.data && !searchState.isLoading && (
               <div className="mb-8 p-4 bg-emerald-500/5 rounded-full inline-block">
                 <Activity className="w-12 h-12 text-emerald-400" />
               </div>
            )}
            {!searchState.data && (
                <>
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
                    Smart Stock Analysis
                  </h2>
                  <p className="text-lg text-slate-400 max-w-2xl mb-8">
                    Get real-time metrics, technical indicators, and AI-driven insights for any public company. Powered by Gemini.
                  </p>
                </>
            )}
            
            <SearchBar onSearch={handleSearch} isLoading={searchState.isLoading} />
        </div>

        {/* Loading State */}
        {searchState.isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
                </div>
             </div>
             <p className="text-slate-400 animate-pulse font-medium">Analyzing market data & news...</p>
             <p className="text-xs text-slate-600">Checking technicals, reading reports, gathering prices.</p>
          </div>
        )}

        {/* Error State */}
        {searchState.error && (
          <div className="max-w-lg mx-auto bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 flex items-start gap-4 text-rose-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-rose-100 mb-1">Analysis Failed</h3>
              <p className="text-sm opacity-90">{searchState.error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {searchState.data && <StockDashboard data={searchState.data} />}
      </main>
      
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-900 mt-auto">
        <p>&copy; {new Date().getFullYear()} MarketMind AI. Data provided by Gemini with Google Search.</p>
        <p className="text-xs mt-2 opacity-60">Not financial advice. For informational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;