import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { ChartPoint } from '../types';

interface PriceChartProps {
  data: ChartPoint[];
  isLoading?: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, isLoading = false }) => {
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Calculate overall trend color
  const chartColor = useMemo(() => {
    if (!data || data.length < 2) return "#10b981";
    const start = data[0].price;
    const end = data[data.length - 1].price;
    return end >= start ? "#10b981" : "#f43f5e";
  }, [data]);

  // Measurement logic
  const getPercentChange = (startPrice: number, endPrice: number) => {
    if (startPrice === 0) return 0;
    return ((endPrice - startPrice) / startPrice) * 100;
  };

  const onMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    setRefAreaLeft(e.activeLabel);
    setRefAreaRight(e.activeLabel); // Initialize right same as left
    setIsSelecting(true);
  };

  const onMouseMove = (e: any) => {
    if (isSelecting && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const onMouseUp = () => {
    setIsSelecting(false);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  // Helper to find price by label (date)
  const getPriceByLabel = (label: string) => {
    const point = data.find(p => p.date === label);
    return point ? point.price : 0;
  };

  const renderCustomTooltip = ({ active, payload, label }: any) => {
     if (active && payload && payload.length) {
       const currentPrice = payload[0].value;
       
       // Calculate change from selection OR from start of chart
       let basePrice = 0;
       let changeLabel = "Change (since start)";
       
       if (isSelecting && refAreaLeft) {
          basePrice = getPriceByLabel(refAreaLeft);
          changeLabel = "Change from selection";
       } else if (data.length > 0) {
          basePrice = data[0].price;
       }

       const diff = getPercentChange(basePrice, currentPrice);
       const color = diff >= 0 ? 'text-emerald-400' : 'text-rose-400';
       
       return (
          <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl min-w-[140px]">
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className="text-slate-100 font-bold mb-1 text-lg">${currentPrice.toFixed(2)}</p>
            <div className="border-t border-slate-800 pt-1 mt-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{changeLabel}</p>
              <p className={`font-bold ${color}`}>{diff > 0 ? '+' : ''}{diff.toFixed(2)}%</p>
            </div>
          </div>
       );
     }
     return null;
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900/50 rounded-lg animate-pulse">
        <div className="text-slate-600 text-sm">Loading Chart Data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900/50 rounded-lg">
        <div className="text-slate-600 text-sm">No chart data available</div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full min-h-[300px] select-none cursor-crosshair"
      onMouseLeave={onMouseUp} 
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
            <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#94a3b8" strokeWidth="1" opacity="0.1"/>
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            hide={true} 
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            tick={{ fill: '#64748b', fontSize: 11 }} 
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={renderCustomTooltip} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={chartColor} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
            animationDuration={500}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea 
                x1={refAreaLeft} 
                x2={refAreaRight} 
                strokeOpacity={0.3} 
                fill="url(#diagonalHatch)"
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
