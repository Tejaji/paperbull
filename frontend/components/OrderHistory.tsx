'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
  type: string;
  status: string;
  timestamp: string;
}

interface GroupedOrders {
  [date: string]: Order[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('Fetching orders from:', `${apiUrl}/api/paper-trading/orders`);
      
      const response = await fetch(`${apiUrl}/api/paper-trading/orders`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Orders data received:', data);
      
      const ordersList = data.orders || [];
      
      // Sort orders by timestamp (newest first)
      const sortedOrders = ordersList.sort((a: Order, b: Order) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      // Group orders by date
      const grouped = sortedOrders.reduce((acc: GroupedOrders, order: Order) => {
        const date = new Date(order.timestamp).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        if (!acc[date]) {
          acc[date] = [];
        }
        
        acc[date].push(order);
        return acc;
      }, {});
      
      setOrders(sortedOrders);
      setGroupedOrders(grouped);

    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }

  function formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  function formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-gray-400">Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Order History</h2>
          <div className="text-sm text-gray-400 mt-1">
            Total Orders: {orders.length}
          </div>
        </div>
        <button
          onClick={fetchOrders}
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

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-xl text-gray-400 mb-2">No orders yet</div>
          <div className="text-sm text-gray-500">Your order history will appear here</div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([date, dateOrders]) => (
            <div key={date} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Date Header */}
              <div className="bg-gray-700/50 px-4 py-2 font-semibold text-sm flex justify-between items-center">
                <span>📅 {date}</span>
                <span className="text-gray-400">{dateOrders.length} orders</span>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="p-3 text-left">Time</th>
                      <th className="p-3 text-left">Order ID</th>
                      <th className="p-3 text-left">Symbol</th>
                      <th className="p-3 text-center">Type</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateOrders.map((order) => {
                      const total = order.quantity * order.price;
                      
                      return (
                        <tr key={order.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="p-3 text-gray-400">{formatTime(order.timestamp)}</td>
                          <td className="p-3 font-mono text-xs">{order.id}</td>
                          <td className="p-3 font-semibold">{order.symbol}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.side === 'BUY' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {order.side}
                            </span>
                          </td>
                          <td className="p-3 text-right">{order.quantity}</td>
                          <td className="p-3 text-right">₹{order.price.toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold">₹{total.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.status === 'COMPLETED' 
                                ? 'bg-blue-900/30 text-blue-400' 
                                : order.status === 'PENDING'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
