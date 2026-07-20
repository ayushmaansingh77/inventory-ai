import { useState } from "react";
import api from "../api/axiosInstance"

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
        password: password,
      });

      const token = response.data.token;
      onLogin(token);

    } catch (err) {
      const message = err.response?.data?.error || "Invalid email or password. Please try again.";
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
      await api.post("/auth/resend-verification", { email: email.trim() });
      setResendStatus("Verification email sent — check your inbox.");
    } catch (err) {
      setResendStatus(err.response?.data?.error || "Failed to resend email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Inventory AI</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Sign in to your account</p>

        {registrationMessage && (
          <div className="text-green-700 text-sm mb-4 bg-green-50 p-3 rounded-lg border border-green-100">
            {registrationMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 animate-fadeIn">
              {error}
              {needsVerification && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-600 underline text-sm"
                  >
                    Resend verification email
                  </button>
                  {resendStatus && (
                    <p className="text-gray-600 text-xs mt-1">{resendStatus}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition duration-200 shadow-sm"
          >
            {loading ? "Checking details..." : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default LoginForm;