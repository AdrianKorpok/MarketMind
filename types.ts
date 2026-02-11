export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

export interface ChartPoint {
  date: string;
  price: number;
}

export interface StockAnalysis {
  symbol: string;
  companyName: string;
  chartData: ChartPoint[];
  stats: Record<string, string>; // Key-value map for all financial metrics
  summary: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: StockAnalysis | null;
}
