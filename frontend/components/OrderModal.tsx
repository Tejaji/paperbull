'use client';

import { useState, useEffect } from 'react';

export interface OrderDetails {
  side: 'BUY' | 'SELL';
  lots: number;
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  limitPrice?: number;
  triggerPrice?: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderDetails: OrderDetails) => void;
  contract: any;
  initialSide: 'BUY' | 'SELL';
}

export default function OrderModal({ isOpen, onClose, onSubmit, contract, initialSide }: OrderModalProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>(initialSide);
  const [lots, setLots] = useState(1);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'SL' | 'SL-M'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');

  useEffect(() => {
    setSide(initialSide);
  }, [initialSide]);

  useEffect(() => {
    if (contract) {
      setLimitPrice(contract.ltp.toFixed(2));
      setTriggerPrice(contract.ltp.toFixed(2));
    }
  }, [contract]);

  if (!isOpen || !contract) return null;

  function handleSubmit() {
    const orderDetails: OrderDetails = {
      side,
      lots,
      orderType,
      limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
      triggerPrice: triggerPrice ? parseFloat(triggerPrice) : undefined,
    };

    onSubmit(orderDetails);
  }

  const totalValue = contract.ltp * lots * contract.lotSize;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{contract.tradingSymbol}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSide('BUY')}
              className={`flex-1 py-2 rounded font-medium ${
                side === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setSide('SELL')}
              className={`flex-1 py-2 rounded font-medium ${
                side === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Lots */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Quantity (Lots)</label>
            <input
              type="number"
              value={lots}
              onChange={(e) => setLots(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
            <p className="text-xs text-gray-400 mt-1">
              {lots} lot(s) = {lots * contract.lotSize} qty
            </p>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
              <option value="SL">Stop Loss</option>
              <option value="SL-M">Stop Loss Market</option>
            </select>
          </div>

          {/* Limit Price */}
          {(orderType === 'LIMIT' || orderType === 'SL') && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Limit Price</label>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                step="0.05"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
          )}

          {/* Trigger Price */}
          {(orderType === 'SL' || orderType === 'SL-M') && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trigger Price</label>
              <input
                type="number"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                step="0.05"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
          )}

          {/* Total Value */}
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Value</span>
              <span className="text-white font-bold">₹{totalValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className={`w-full py-3 rounded font-bold text-white ${
              side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Place {side} Order
          </button>
        </div>
      </div>
    </div>
  );
}
