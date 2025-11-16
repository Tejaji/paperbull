"use client";

interface MarketClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MarketClosedModal({ isOpen, onClose }: MarketClosedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-6xl">🔒</div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Market is Closed
        </h2>

        {/* Message */}
        <p className="text-gray-400 text-center mb-6">
          Trading is only available during market hours: <br />
          <span className="text-white font-semibold">9:15 AM - 3:30 PM IST</span>
          <br />
          <span className="text-sm text-gray-500 mt-2 block">Monday to Friday</span>
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
