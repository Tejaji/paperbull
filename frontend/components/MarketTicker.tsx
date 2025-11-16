'use client';

import { useState, useEffect } from 'react';

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export default function MarketTicker({ darkMode }: { darkMode: boolean }) {
  const [indices, setIndices] = useState<IndexData[]>([
    { name: 'NIFTY 50', value: 25492.30, change: -17.40, changePercent: -0.07 },
    { name: 'SENSEX', value: 84449.90, change: -55.47, changePercent: -0.07 },
    { name: 'NIFTY BANK', value: 55123.75, change: 123.45, changePercent: 0.22 },
    { name: 'FINNIFTY', value: 23850.60, change: -45.20, changePercent: -0.19 },
    { name: 'MIDCAP NIFTY', value: 14567.80, change: 89.30, changePercent: 0.62 },
    { name: 'NIFTY IT', value: 42346.50, change: -120.30, changePercent: -0.28 },
    { name: 'NIFTY PHARMA', value: 22145.90, change: 67.80, changePercent: 0.31 },
    { name: 'NIFTY AUTO', value: 25678.40, change: 145.60, changePercent: 0.57 },
    { name: 'BSE SENSEX', value: 84449.90, change: -55.47, changePercent: -0.07 },
    { name: 'BSE 500', value: 45123.60, change: 234.50, changePercent: 0.52 },
    { name: 'NIFTY SMALLCAP', value: 18234.70, change: -89.20, changePercent: -0.49 },
    { name: 'INDIA VIX', value: 13.45, change: -0.23, changePercent: -1.68 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => ({
        ...idx,
        value: idx.value + (Math.random() - 0.5) * 10,
        change: idx.change + (Math.random() - 0.5) * 2,
        changePercent: idx.changePercent + (Math.random() - 0.5) * 0.1,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const textClass = darkMode ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className="flex gap-8 px-4">
      {[...indices, ...indices].map((index, idx) => (
        <div key={idx} className="flex items-center gap-3 min-w-fit">
          <span className={`font-semibold ${textClass}`}>{index.name}</span>
          <span className={`font-bold ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {index.value.toFixed(2)}
          </span>
          <span className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.change).toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
          </span>
        </div>
      ))}
    </div>
  );
}
