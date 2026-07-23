import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import Footer from "./Footer";
import brandLogo from "../assets/brandlogo.png";

const LoginForm = ({ onLogin, registrationMessage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setNeedsVerification(false);
    setResendStatus("");

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token = response.data.token;
      onLogin(token);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Invalid email or password. Please try again.";

      setError(message);

      if (message === "Please verify your email before logging in.") {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus("Sending...");

    try {
      await api.post("/auth/resend-verification", {
        email: email.trim(),
      });

      setResendStatus("Verification email sent — check your inbox.");
    } catch (err) {
      setResendStatus(
        err.response?.data?.error || "Failed to resend verification email."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Branding Panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-700 to-teal-900 text-white flex-col justify-center items-center p-12">
          <img
            src={brandLogo}
            alt="StockMind Logo"
            className="w-60 h-40 mb-6"
          />

          <h1 className="text-4xl font-bold mb-4">StockMind</h1>

          <p className="text-teal-100 text-center max-w-sm">
            Smart inventory management with real-time demand forecasting.
          </p>
        </div>

        {/* Right Login Panel */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors mb-5"
            >
              ← Back to Home
            </Link>

            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              Welcome back
            </h2>

            <p className="text-slate-500 text-sm text-center mb-6">
              Sign in to your StockMind account
            </p>

            {registrationMessage && (
              <div className="text-emerald-800 text-sm mb-5 bg-emerald-50 p-3.5 rounded-lg border border-emerald-200">
                {registrationMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 tracking-wider">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 tracking-wider">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-rose-700 text-sm bg-rose-50 p-3.5 rounded-lg border border-rose-200">
                  {error}

                  {needsVerification && (
                    <div className="mt-2 pt-2 border-t border-rose-200">
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Resend verification email
                      </button>

                      {resendStatus && (
                        <p className="text-slate-600 text-xs mt-1">
                          {resendStatus}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50 focus:ring-2 focus:ring-blue-500/20"
              >
                {loading ? "Checking details..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginForm;