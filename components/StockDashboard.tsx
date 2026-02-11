import React, { useState, useEffect } from 'react';
import { StockAnalysis, TimeRange } from '../types';
import PriceChart from './PriceChart';
import SortableSection from './SortableSection';
import { getChartData } from '../services/geminiService';
import { ExternalLink, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface StockDashboardProps {
  data: StockAnalysis;
}

// Group definitions
const CATEGORIES: Record<string, { title: string; keys: string[] }> = {
  valuation: {
    title: "Valuation & Ratios",
    keys: ["Market Cap", "Enterprise Value", "P/E", "Forward P/E", "PEG", "P/S", "P/B", "P/C", "P/FCF", "EV/EBITDA", "EV/Sales"]
  },
  profitability: {
    title: "Profitability & Margins",
    keys: ["EPS (ttm)", "EPS next Y", "EPS next Q", "EPS this Y", "EPS next 5Y", "EPS past 3/5Y", "Gross Margin", "Oper. Margin", "Profit Margin", "Payout", "ROA", "ROE", "ROIC"]
  },
  income: {
    title: "Income & Earnings",
    keys: ["Sales", "Income", "Sales past 3/5Y", "Sales Y/Y TTM", "Sales Q/Q", "EPS Y/Y TTM", "EPS Q/Q", "Earnings", "EPS/Sales Surpr."]
  },
  balance: {
    title: "Balance Sheet & Liquidity",
    keys: ["Cash/sh", "Book/sh", "Debt/Eq", "LT Debt/Eq", "Quick Ratio", "Current Ratio"]
  },
  dividends: {
    title: "Dividends",
    keys: ["Dividend Est.", "Dividend TTM", "Dividend Ex-Date", "Dividend Gr. 3/5Y"]
  },
  performance: {
    title: "Performance & Technicals",
    keys: ["Perf Week", "Perf Month", "Perf Quarter", "Perf Half Y", "Perf YTD", "Perf Year", "Perf 3Y", "Perf 5Y", "Perf 10Y", "52W High", "52W Low", "RSI (14)", "ATR (14)", "SMA20", "SMA50", "SMA200", "Volatility", "Beta", "Change", "Price", "Prev Close"]
  },
  ownership: {
    title: "Ownership & Shorts",
    keys: ["Shs Outstand", "Shs Float", "Short Float", "Short Ratio", "Short Interest", "Insider Own", "Insider Trans", "Inst Own", "Inst Trans", "Option/Short", "Trades", "Volume", "Avg Volume", "Rel Volume"]
  },
  general: {
    title: "General Info",
    keys: ["Index", "Employees", "IPO", "Recom", "Target Price"]
  }
};

const StockDashboard: React.FC<StockDashboardProps> = ({ data }) => {
  const [activeRange, setActiveRange] = useState<TimeRange>('1Y');
  const [chartData, setChartData] = useState(data.chartData);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // Persistent State for Order and Collapse
  const [order, setOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-order');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Ensure all current keys exist in parsed (handle schema updates)
            const currentKeys = Object.keys(CATEGORIES);
            const merged = [...new Set([...parsed, ...currentKeys])].filter(k => currentKeys.includes(k));
            return merged;
        } catch(e) {}
    }
    return Object.keys(CATEGORIES);
  });

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('dashboard-collapsed');
    return saved ? JSON.parse(saved) : {};
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before drag starts, prevents accidental clicks becoming drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    localStorage.setItem('dashboard-order', JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    localStorage.setItem('dashboard-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Chart Updates
  const handleRangeChange = async (range: TimeRange) => {
    if (range === activeRange) return;
    setActiveRange(range);
    setIsChartLoading(true);
    try {
        const points = await getChartData(data.symbol, range);
        if (points && points.length > 0) {
            setChartData(points);
        }
    } catch (e) {
        console.error("Failed to update chart", e);
    } finally {
        setIsChartLoading(false);
    }
  };

  // Reset chart when symbol changes (using 1Y default)
  useEffect(() => {
     // If the initial data is from a 1M query (default in analyzeStock), 
     // we might want to fetch 1Y immediately or just let the user see the default data
     // For now, let's respect the user's preference for 1Y default by fetching it if the loaded data looks small,
     // or just set chartData to what came in initially and set activeRange to '1Y' if consistent.
     // However, analyzeStock returns 1Y data now per my change in geminiService.
    setChartData(data.chartData);
    setActiveRange('1Y');
  }, [data.symbol, data.chartData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleSection = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentPrice = data.stats['Price'] || '0.00';
  const change = data.stats['Change'] || '0%';
  const isPositive = !change.startsWith('-');
  const ranges: TimeRange[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

  return (
    <div className="animate-fade-in pb-20 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          {/* Info Block */}
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-bold text-slate-100">{data.symbol}</h2>
              <span className="text-lg text-slate-400 font-medium truncate max-w-[200px]">{data.companyName}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-bold text-slate-100">
                {currentPrice}
              </span>
              <span className={`text-lg font-semibold px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {change}
              </span>
            </div>
            <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3"/>
                <span>Real-time data via Google Search</span>
            </div>
          </div>
          
          {/* Chart Block */}
          <div className="flex-grow flex flex-col h-[350px] lg:h-[300px] min-w-0">
             <div className="flex justify-end mb-2 space-x-1 overflow-x-auto pb-1 no-scrollbar">
                {ranges.map((r) => (
                    <button
                        key={r}
                        onClick={() => handleRangeChange(r)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            activeRange === r 
                            ? 'bg-slate-700 text-white' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                        {r}
                    </button>
                ))}
             </div>
             <div className="flex-grow min-h-0 bg-slate-900/50 rounded-lg">
                <PriceChart data={chartData} isLoading={isChartLoading} />
             </div>
             <p className="text-right text-[10px] text-slate-600 mt-1">
                Click & drag chart to measure % change
             </p>
          </div>
        </div>
      </div>

      {/* AI Summary Section - Below Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg mb-6 overflow-hidden">
        <div 
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        >
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-100">AI Executive Summary</h3>
            </div>
             {summaryExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
        {summaryExpanded && (
            <div className="p-6 pt-0 border-t border-slate-800/50 mt-4">
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                    {data.summary}
                </p>
            </div>
        )}
      </div>

      {/* Sortable Metrics Tables */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => (
            <SortableSection 
              key={id}
              id={id}
              title={CATEGORIES[id].title}
              keys={CATEGORIES[id].keys}
              stats={data.stats}
              isExpanded={!collapsed[id]}
              onToggle={toggleSection}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Sources */}
      {data.sources.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Data Sources</h4>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
                >
                  <span className="truncate max-w-[200px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default StockDashboard;
