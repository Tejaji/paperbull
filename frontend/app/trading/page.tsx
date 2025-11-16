"use client";
import AdBanner from '../../components/AdBanner';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OptionChain from "../../components/OptionChain";
import Positions from "../../components/Positions";
import AnnouncementBanner from "../../components/AnnouncementBanner";
import { ToastProvider } from "../../components/ToastContainer";


export default function TradingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chain" | "positions">("chain");
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");


    if (!token || !userData) {
      router.push("/login");
      return;
    }


    setUser(JSON.parse(userData));
  }, [router]);


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  const capital = user.role === "premium" ? "₹10,00,000" : "₹1,00,000";


  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">PaperBull</h1>
              <p className="text-sm text-blue-100 mt-1">Virtual Trading Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Welcome, {user.username}</p>
              <p className="font-semibold">{capital} Capital</p>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push("/login");
                }}
                className="mt-2 text-xs bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>


        {/* Announcement Banner - Positioned here */}
        <div className="bg-gray-900 px-6 pt-4">
          <AnnouncementBanner />
        </div>


        {/* Tabs */}
        <nav className="bg-gray-800 border-b border-gray-700 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("chain")}
              className={`py-3 px-2 font-medium border-b-2 transition ${
                activeTab === "chain"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Option chain
            </button>
            <button
              onClick={() => setActiveTab("positions")}
              className={`py-3 px-2 font-medium border-b-2 transition ${
                activeTab === "positions"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Positions
            </button>
          </div>
        </nav>


        {/* Content */}
        <main className="flex-1 overflow-auto">
          {activeTab === "chain" && <OptionChain />}
          {activeTab === "positions" && <Positions />}
        </main>

        {/* Ad Banner at Bottom - Only for Free Users */}
        {user?.role === 'free' && (
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <AdBanner 
              dataAdSlot="YOUR_AD_SLOT_ID"
              style={{ minHeight: '100px' }}
            />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
