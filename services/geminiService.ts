import { GoogleGenAI } from "@google/genai";
import { StockAnalysis, ChartPoint, TimeRange } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Switching to gemini-3-flash-preview as it supports Search tools reliably and is fast.
const MODEL_NAME = "gemini-3-flash-preview"; 

export const analyzeStock = async (symbol: string): Promise<StockAnalysis> => {
  const prompt = `
    Fetch real-time financial data for stock symbol: "${symbol}".
    You must use Google Search to find the latest values.
    
    TASK 1: Extract a dense table of financial metrics.
    TASK 2: Generate a 1-year price history array (approximate if exact daily data isn't available, but capture the trend).
    TASK 3: Write a concise paragraph summarizing recent major news, earnings reports (beats/misses), or events affecting the stock.

    REQUIRED JSON STRUCTURE:
    \`\`\`json
    {
      "symbol": "${symbol}",
      "companyName": "Full Company Name",
      "stats": {
        "Index": "e.g. NDX", "P/E": "...", "EPS (ttm)": "...", "Insider Own": "...", "Shs Outstand": "...", "Perf Week": "...",
        "Market Cap": "...", "Forward P/E": "...", "EPS next Y": "...", "Insider Trans": "...", "Shs Float": "...", "Perf Month": "...",
        "Enterprise Value": "...", "PEG": "...", "EPS next Q": "...", "Inst Own": "...", "Short Float": "...", "Perf Quarter": "...",
        "Income": "...", "P/S": "...", "EPS this Y": "...", "Inst Trans": "...", "Short Ratio": "...", "Perf Half Y": "...",
        "Sales": "...", "P/B": "...", "EPS next Y (%)": "...", "ROA": "...", "Short Interest": "...", "Perf YTD": "...",
        "Book/sh": "...", "P/C": "...", "EPS next 5Y": "...", "ROE": "...", "52W High": "...", "Perf Year": "...",
        "Cash/sh": "...", "P/FCF": "...", "EPS past 3/5Y": "...", "ROIC": "...", "52W Low": "...", "Perf 3Y": "...",
        "Dividend Est.": "...", "EV/EBITDA": "...", "Sales past 3/5Y": "...", "Gross Margin": "...", "Volatility": "...", "Perf 5Y": "...",
        "Dividend TTM": "...", "EV/Sales": "...", "EPS Y/Y TTM": "...", "Oper. Margin": "...", "ATR (14)": "...", "Perf 10Y": "...",
        "Dividend Ex-Date": "...", "Quick Ratio": "...", "Sales Y/Y TTM": "...", "Profit Margin": "...", "RSI (14)": "...", "Recom": "...",
        "Dividend Gr. 3/5Y": "...", "Current Ratio": "...", "EPS Q/Q": "...", "SMA20": "...", "Beta": "...", "Target Price": "...",
        "Payout": "...", "Debt/Eq": "...", "Sales Q/Q": "...", "SMA50": "...", "Rel Volume": "...", "Prev Close": "...",
        "Employees": "...", "LT Debt/Eq": "...", "Earnings": "...", "SMA200": "...", "Avg Volume": "...", "Price": "...",
        "IPO": "...", "Option/Short": "...", "EPS/Sales Surpr.": "...", "Trades": "...", "Volume": "...", "Change": "..."
      },
      "chartData": [ { "date": "YYYY-MM-DD", "price": 123.45 }, ... ],
      "summary": "Brief summary of recent earnings, news, and events..."
    }
    \`\`\`

    Format numbers professionally (e.g. 1.23B, 45.6M, +1.2%). Use N/A if missing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" // Removed to ensure Search works correctly and we get citations
      },
    });

    const text = response.text || "{}";
    
    // Extract JSON from Markdown code block or raw JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
       console.error("Failed response text:", text);
       throw new Error("AI did not return valid JSON data.");
    }
    
    const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    
    // Extract sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web?.uri) {
            return { title: chunk.web.title || "Source", url: chunk.web.uri };
        }
        return null;
    }).filter(Boolean) || [];

    return {
      symbol: parsedData.symbol || symbol,
      companyName: parsedData.companyName || symbol,
      chartData: parsedData.chartData || [],
      stats: parsedData.stats || {},
      summary: parsedData.summary || "No summary available.",
      sources: sources as Array<{ title: string; url: string }>
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getChartData = async (symbol: string, range: TimeRange): Promise<ChartPoint[]> => {
  const prompt = `
    Generate a JSON array of price points for stock "${symbol}" for the time range: "${range}".
    Use Google Search to find historical data or trends.
    Return ONLY a raw JSON array: [{"date": "...", "price": ...}, ...]
    Rules:
    - 1D: Intraday (approx 30 mins interval)
    - 5D: Daily close or hourly
    - 1M - 5Y: Daily or Weekly close
    - MAX: Monthly close over all time available
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "[]";
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
    const data = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Chart Fetch Error:", error);
    return [];
  }
}
