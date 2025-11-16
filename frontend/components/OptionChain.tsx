"use client";

import { useState, useEffect } from "react";
import { isMarketOpen, getMarketStatus } from "../utils/marketStatus";

// Ad Banner Component
function AdBanner({ dataAdSlot, style }: { dataAdSlot: string; style?: React.CSSProperties }) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        ...style
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={dataAdSlot}
      data-ad-format="auto"
    />
  );
}

export default function OptionChain() {
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, message: "" });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const status = getMarketStatus();
    setMarketStatus(status);

    const interval = setInterval(() => {
      const newStatus = getMarketStatus();
      setMarketStatus(newStatus);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!marketStatus.isOpen) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-6">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="text-8xl">🔒</div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Market is Closed
          </h2>

          <p className="text-gray-400 text-lg mb-3">
            Trading is only available during market hours:
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-blue-400">
              9:15 AM - 3:30 PM IST
            </p>
            <p className="text-sm text-gray-500 mt-2">Monday to Friday</p>
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">Current Status:</p>
            <p className="text-lg font-semibold text-red-400">{marketStatus.message}</p>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            You can view your positions and order history while the market is closed.
          </p>

          {/* Ad for free users when market is closed */}
          {user?.role === 'free' && (
            <div className="mt-6">
              <AdBanner 
                dataAdSlot="YOUR_AD_SLOT_ID"
                style={{ minHeight: '100px' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Ad for free users at the top when market is open */}
      {user?.role === 'free' && (
        <div className="mb-4">
          <AdBanner 
            dataAdSlot="YOUR_AD_SLOT_ID"
            style={{ minHeight: '90px' }}
          />
        </div>
      )}

      <div className="text-center text-gray-400 py-8">
        <p className="text-green-400 font-semibold mb-2">✓ Market is Open</p>
        <p>Option chain will load here when market is open</p>
      </div>

      {/* Ad for free users at the bottom when market is open */}
      {user?.role === 'free' && (
        <div className="mt-6">
          <AdBanner 
            dataAdSlot="YOUR_AD_SLOT_ID"
            style={{ minHeight: '100px' }}
          />
        </div>
      )}
    </div>
  );
}
