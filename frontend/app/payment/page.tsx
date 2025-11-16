'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function PaymentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');
  const [transactionId, setTransactionId] = useState('');
  const [showQR, setShowQR] = useState(true); // Show QR by default

  // Your UPI ID for receiving payments
  const UPIID = '9408306049@hdfcbank'; // Replace with your actual UPI ID
  const AMOUNT = 99;

  useEffect(() => {
    // Get phone and name from URL params
    const phoneParam = searchParams.get('phone');
    const nameParam = searchParams.get('name');
    if (phoneParam) setPhone(phoneParam);
    if (nameParam) setName(nameParam);
  }, [searchParams]);

  // Generate UPI payment link
  const generateUPILink = () => {
    const upiLink = `upi://pay?pa=${UPIID}&pn=PaperBull&am=${AMOUNT}&cu=INR&tn=Premium Membership`;
    return upiLink;
  };

  // Generate QR code URL using a QR code API
  const generateQRCode = () => {
    const upiLink = generateUPILink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
  };

  // Handle payment verification
  async function handleVerifyPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!transactionId || transactionId.length < 12) {
      alert('Please enter a valid transaction ID');
      return;
    }
    setPaymentStatus('verifying');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, transactionId, amount: AMOUNT }),
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentStatus('success');
        // Register user as premium after successful payment
        setTimeout(registerPremiumUser, 2000);
      } else {
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      alert(error.message || 'Payment verification failed. Please contact support.');
    }
  }

  // Register user as premium after payment
  async function registerPremiumUser() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, username: name, role: 'premium' }),
      });
      if (response.ok) {
        // Redirect to login page
        router.push(`/login?phone=${phone}&registered=true`);
      }
    } catch (error) {
      // Registration error handling
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2"></div>
          <h1 className="text-3xl font-bold text-gray-800">Premium Membership</h1>
          <p className="text-gray-600 mt-2">Unlock 10 Lakh virtual capital</p>
        </div>
        {/* Payment pending */}
        {paymentStatus === 'pending' && (
          <div>
            {/* Amount Box */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white text-center">
              <p className="text-sm opacity-90">Monthly Subscription</p>
              <p className="text-5xl font-bold mt-2">₹99</p>
              <p className="text-sm opacity-90 mt-2">per month</p>
            </div>
            {/* Payment Methods */}
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-gray-800 text-center">Choose Payment Method</h3>
              {/* UPI Apps Button */}
              <a
                href={generateUPILink()}
                className="block w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
              >
                Pay with UPI Apps
              </a>
              {/* Show QR Code Button */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                {showQR ? 'Hide QR Code' : 'Scan QR Code'}
              </button>
              {/* QR Code Display */}
              {showQR && (
                <div className="bg-gray-50 p-6 rounded-xl text-center">
                  <img src={generateQRCode()} alt="UPI QR Code" className="mx-auto mb-4" width={250} height={250} />
                  <p className="text-sm text-gray-600">Scan with any UPI app</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono break-all">{UPIID}</p>
                </div>
              )}
            </div>
            {/* Transaction ID Input */}
            <form onSubmit={handleVerifyPayment} className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Transaction ID / UPI Ref No.</label>
                <input
                  type="text"
                  placeholder="e.g., 402912345678"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={12}
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 12-digit UTR/Transaction ID from your payment app</p>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Verify Payment
              </button>
            </form>
            <button
              onClick={() => router.back()}
              className="w-full text-gray-600 text-sm hover:underline mt-2"
            >
              Back to Registration
            </button>
          </div>
        )}

        {/* Verifying */}
        {paymentStatus === 'verifying' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Verifying your payment...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Success */}
        {paymentStatus === 'success' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your premium account is being activated...</p>
          </div>
        )}

        {/* Failed */}
        {paymentStatus === 'failed' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">Please check your transaction ID and try again</p>
            <button
              onClick={() => setPaymentStatus('pending')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Page exported with Suspense boundary as required by Next.js
export default function PaymentPageSuspense() {
  return (
    <Suspense fallback={<div>Loading payment page...</div>}>
      <PaymentPageInner />
    </Suspense>
  );
}
