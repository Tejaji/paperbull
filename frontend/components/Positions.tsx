'use client';
import OrderHistory from './OrderHistory';
import { useState, useEffect } from 'react';
import AdBanner from './AdBanner';

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
}

interface PnL {
  realized: number;
  unrealized: number;
  total: number;
}

interface User {
  id: string;
  phone: string;
  username: string;
  role: string;
}

export default function Positions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnl, setPnl] = useState<PnL>({ realized: 0, unrealized: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    fetchData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('Fetching positions from:', `${apiUrl}/api/paper-trading/portfolio`);
      
      // Fetch portfolio data from paper trading API
      const response = await fetch(`${apiUrl}/api/paper-trading/portfolio`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio: ${response.status}`);
      }

      const portfolioData = await response.json();
      
      console.log('Portfolio data received:', portfolioData);
      
      // Extract positions and calculate P&L
      const positionsList = portfolioData.positions || [];
      const totalPnL = positionsList.reduce((sum: number, pos: Position) => {
        return sum + (pos.pnl || 0);
      }, 0);
      
      setPositions(positionsList);
      setPnl({
        realized: 0,
        unrealized: totalPnL,
        total: totalPnL
      });

    } catch (err: any) {
      console.error('Error fetching positions:', err);
      setError(err.message || 'Failed to load positions');
    } finally {
      setLoading(false);
    }
  }

  if (loading && positions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-gray-400">Loading positions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-gray-400 text-sm mb-1">Total Positions</div>
            <div className="text-2xl font-bold">{positions.length}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${pnl.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{pnl.total.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Capital Used</div>
            <div className="text-2xl font-bold">
              ₹{positions.reduce((sum, pos) => sum + (pos.avgPrice * pos.quantity), 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner for Free Users - After Portfolio Summary */}
      {user?.role === 'free' && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <AdBanner 
            dataAdSlot="YOUR_AD_SLOT_ID"
            style={{ minHeight: '90px' }}
          />
        </div>
      )}

      {/* Open Positions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Open Positions</h2>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded transition"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {positions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-xl text-gray-400 mb-2">No open positions</div>
            <div className="text-sm text-gray-500">Place your first order from the Option Chain tab</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-3 text-left">Symbol</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Avg Price</th>
                  <th className="p-3 text-right">Current Price</th>
                  <th className="p-3 text-right">P&L</th>
                  <th className="p-3 text-right">P&L %</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => {
                  const pnlPercent = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;
                  
                  return (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3 font-semibold">{position.symbol}</td>
                      <td className="p-3 text-right">{position.quantity}</td>
                      <td className="p-3 text-right">₹{position.avgPrice.toFixed(2)}</td>
                      <td className="p-3 text-right">₹{position.currentPrice.toFixed(2)}</td>
                      <td className={`p-3 text-right font-semibold ${
                        position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${
                        pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleSquareOff(position)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                        >
                          Square Off
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History */}
      <OrderHistory />

      {/* Bottom Ad Banner for Free Users */}
      {user?.role === 'free' && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <AdBanner 
            dataAdSlot="YOUR_AD_SLOT_ID"
            style={{ minHeight: '90px' }}
          />
        </div>
      )}
    </div>
  );

  async function handleSquareOff(position: Position) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/paper-trading/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: position.symbol,
          quantity: position.quantity,
          price: position.currentPrice,
          side: 'SELL',
          type: 'MARKET'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to square off position');
      }

      alert(`✅ Position squared off successfully!\nSymbol: ${position.symbol}\nP&L: ₹${position.pnl.toFixed(2)}`);
      
      // Refresh positions
      fetchData();
      
    } catch (error: any) {
      console.error('Square off error:', error);
      alert(`❌ Failed to square off: ${error.message}`);
    }
  }
}
