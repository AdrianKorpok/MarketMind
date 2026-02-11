import React from 'react';

interface MetricsGridProps {
  stats: Record<string, string>;
  keys: string[];
}

const KPI_DEFINITIONS: Record<string, string> = {
  "Market Cap": "Total value of a company's shares of stock.",
  "P/E": "Price-to-Earnings ratio. Valuation ratio of current share price to per-share earnings.",
  "EPS (ttm)": "Earnings Per Share (Trailing Twelve Months). Profit divided by outstanding shares.",
  "Dividend Yield": "Annual dividend income per share relative to share price.",
  "Beta": "Measure of a stock's volatility in relation to the overall market.",
  "RSI (14)": "Relative Strength Index. Momentum indicator measuring speed and change of price movements.",
  "PEG": "Price/Earnings to Growth ratio. Determines value while factoring in earnings growth.",
  "P/S": "Price-to-Sales ratio. Value placed on each dollar of a company's sales or revenues.",
  "P/B": "Price-to-Book ratio. Market cap divided by book value of equity.",
  "EV/EBITDA": "Enterprise Value to EBITDA. Used to determine the value of a company.",
  "Profit Margin": "Amount by which revenue from sales exceeds costs in a business.",
  "Oper. Margin": "Operating Margin. Profitability after paying for variable costs of production.",
  "Gross Margin": "Difference between revenue and cost of goods sold.",
  "ROA": "Return on Assets. How profitable a company is relative to its total assets.",
  "ROE": "Return on Equity. Profitability relative to stockholders' equity.",
  "Short Ratio": "Number of days it would take short sellers to cover their positions.",
  "Insider Own": "Percentage of shares held by insiders (officers, directors).",
  "Inst Own": "Percentage of shares held by institutional investors.",
  "Perf Week": "Stock performance over the last week.",
  "Perf Year": "Stock performance over the last year.",
  "Volatility": "Statistical measure of the dispersion of returns for a given security.",
  "Target Price": "Projected price level as forecasted by an analyst.",
  "SMA20": "Simple Moving Average over 20 periods.",
  "SMA50": "Simple Moving Average over 50 periods.",
  "SMA200": "Simple Moving Average over 200 periods.",
  "Forward P/E": "Projected Price-to-Earnings ratio for the next 12 months.",
  "Quick Ratio": "Indicator of a company's short-term liquidity position.",
  "Current Ratio": "Liquidity ratio that measures ability to pay short-term obligations.",
  "Debt/Eq": "Debt-to-Equity ratio. Relative proportion of shareholders' equity and debt.",
  "Dividend TTM": "Total dividends paid over the trailing twelve months.",
  "Payout": "Percentage of earnings paid as dividends to shareholders.",
  "Recom": "Analyst recommendation rating (1.0 = Strong Buy, 5.0 = Sell).",
  "ATR (14)": "Average True Range. Volatility indicator.",
  "Rel Volume": "Relative Volume. Ratio of current volume to average volume.",
  "Shs Float": "Shares Float. Number of shares available for trading by the public."
};

const MetricsGrid: React.FC<MetricsGridProps> = ({ stats, keys }) => {
  const getColorClass = (key: string, value: string) => {
    if (!value || value === 'N/A') return 'text-slate-400';
    if (key.includes("Perf") || key.includes("Change") || key.includes("Y/Y") || key.includes("Q/Q") || key.includes("Margin") || key === "SMA20" || key === "SMA50" || key === "SMA200") {
        if (value.includes('-')) return 'text-rose-400';
        if (value.includes('+') || (!value.includes('-') && parseFloat(value) > 0)) return 'text-emerald-400';
    }
    if (key === 'Signal' || key === 'Recom') {
         if (value.toLowerCase().includes('buy')) return 'text-emerald-400';
         if (value.toLowerCase().includes('sell')) return 'text-rose-400';
    }
    return 'text-slate-200';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 p-4">
      {keys.map((key) => {
        const value = stats[key];
        const definition = KPI_DEFINITIONS[key];
        
        return (
          <div key={key} className="flex flex-col border-b border-slate-800/50 pb-1 group relative">
            <span 
              className={`text-[10px] uppercase tracking-wider font-medium truncate w-fit ${definition ? 'cursor-help text-slate-400 hover:text-slate-300 border-b border-dotted border-slate-600' : 'text-slate-500'}`} 
            >
              {key}
            </span>
            
            {/* Tooltip */}
            {definition && (
              <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded shadow-xl z-50 pointer-events-none">
                {definition}
                <div className="absolute top-full left-2 -mt-[1px] border-4 border-transparent border-t-slate-800"></div>
              </div>
            )}

            <span className={`text-xs font-bold truncate ${getColorClass(key, value || '-')}`}>
              {value || '-'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
