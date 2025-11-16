"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserType = "free" | "premium";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState<UserType>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsRegistration) {
          setStep("register");
        } else {
          throw new Error(data.error || "Failed to send OTP");
        }
      } else {
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP and Login
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("account", JSON.stringify(data.account));

      router.push("/trading");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Register New User
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // If premium selected, redirect to payment
    if (userType === "premium") {
      router.push(`/payment?phone=${phone}&name=${encodeURIComponent(name)}`);
      return;
    }

    // For free users, register directly
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, username: name, role: "free" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setStep("phone");
      await handleSendOTP(e);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PaperBull</h1>
          <p className="text-gray-600">Virtual Trading Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === "phone" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">OTP sent to</p>
              <p className="font-semibold text-gray-800">+91 {phone}</p>
              <button
                onClick={() => setStep("phone")}
                className="text-blue-600 text-sm hover:underline mt-2"
              >
                Change number
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full text-blue-600 text-sm hover:underline"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: Registration */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">New User Registration</p>
              <p className="font-semibold text-gray-800">+91 {phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("free")}
                  className={`p-4 border-2 rounded-lg transition ${
                    userType === "free"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-semibold text-gray-800">Free</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">₹1L</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Capital</div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("premium")}
                  className={`p-4 border-2 rounded-lg transition ${
                    userType === "premium"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-semibold text-gray-800">Premium</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">₹10L</div>
                  <div className="text-xs text-gray-600 mt-1">₹99/month</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
            >
              {loading ? "Creating Account..." : userType === "premium" ? "Proceed to Payment" : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-gray-600 text-sm hover:underline"
            >
              ← Back
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            🔒 Secure OTP-based authentication
            <br />
            💰 Start trading with virtual money
          </p>
        </div>
      </div>
    </div>
  );
}
