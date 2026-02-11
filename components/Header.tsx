import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            MarketMind AI
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            <span>Powered by Gemini 3.0</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
