'use client';

import { useState } from "react";
interface ShareholdingData {
  companyName: string;
  symbol: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  data: {
    category: string;
    percentage: number;
  }[];
}
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FaSearch } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const popularStocks = [
  "TCS", "RELIANCE", "INFY", "HDFCBANK", "ICICIBANK", "HINDUNILVR", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK"
];

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [shareholdingData, setShareholdingData] = useState<ShareholdingData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!symbol) return;
    setLoading(true);
    
    try {
      const response = await fetch(`/api/shareholding?symbol=${symbol}`);
      const data = await response.json();
      setShareholdingData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = shareholdingData ? {
    labels: shareholdingData.data.map((item: { category: string }) => item.category),
    datasets: [{
      data: shareholdingData.data.map((item: { percentage: number }) => item.percentage),
      backgroundColor: [
        '#FF6384',  // Pink for Promoters
        '#36A2EB',  // Blue for FIIs
        '#FFCE56',  // Yellow for DIIs
        '#4BC0C0'   // Green for Public
      ]
    }]
  } : null;

  return (
    <div className="min-h-screen bg-[#1a237e] text-white p-4">
      <h1 className="text-3xl font-bold text-center text-[#8c9eff] mb-2">NSE Shareholding Pattern Analyzer</h1>
      <p className="text-center text-gray-300 mb-6">Real-time shareholding data for NSE listed companies</p>

      <div className="max-w-3xl mx-auto bg-[#283593] rounded-lg p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., TCS)"
            className="flex-1 p-2 rounded bg-[#1a237e] text-white border border-[#3d5afe]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-[#3d5afe] rounded hover:bg-[#536dfe] flex items-center gap-2"
          >
            <FaSearch />
            Get Shareholding
          </button>
        </div>

        <div>
          <div className="text-sm text-gray-300 mb-2">Popular Stocks:</div>
          <div className="flex flex-wrap gap-2">
            {popularStocks.map((stock) => (
              <button
                key={stock}
                onClick={() => {
                  setSymbol(stock);
                  handleSearch();
                }}
                className="px-3 py-1 text-sm bg-[#1a237e] rounded hover:bg-[#3d5afe]"
              >
                {stock}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shareholdingData && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#283593] p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{shareholdingData.companyName}</h2>
                <p className="text-sm text-gray-300">{shareholdingData.sector} | {shareholdingData.industry}</p>
              </div>
              <div className="text-right">
                <div className="text-xl">₹{shareholdingData.currentPrice}</div>
                <div className="text-sm text-gray-300">NSE: {shareholdingData.symbol}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Market Cap: {shareholdingData.marketCap}</div>
              <div>P/E Ratio: {shareholdingData.peRatio}</div>
              <div>Dividend Yield: {shareholdingData.dividendYield}</div>
              <div>NSE Symbol: {shareholdingData.symbol}</div>
            </div>
          </div>

          <div className="bg-[#283593] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Shareholding Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[300px] relative">
                {chartData && <Pie data={chartData} options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { color: 'white' }
                    }
                  }
                }} />}
              </div>
              <div className="space-y-2">
                {shareholdingData.data.map((item: { category: string, percentage: number }, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.category}</span>
                    <span>{item.percentage.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
