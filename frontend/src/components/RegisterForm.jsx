import { useState } from "react";
import api from "../api/axiosInstance";
import brandLogo from "../assets/brandlogo.png";
import Footer from "./Footer";

const RegisterForm = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Browser ka default page refresh rokne ke liye

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", {
        email: email.trim(), // Extraneous spaces remove karne ke liye
        password: password,
        username: username.trim(),
        frontend_url: window.location.origin,
      });

      // Agar registration successful ho toh callback call karein
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
      }

    } catch (err) {
      setError(err.response?.data?.error || "Invalid email, password, or username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">

        {/* Left branding panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-700 to-teal-900 text-white flex-col justify-center items-center p-12">
          <img src={brandLogo} alt="StockMind logo" className="w-60 h-40 mb-6" />
          <h1 className="text-4xl font-bold mb-4">StockMind</h1>
          <p className="text-teal-100 text-center max-w-sm">
            Smart inventory management with real-time demand forecasting.
          </p>
        </div>

        {/* Right: form */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">

            {/* Heading (mobile only, since left panel is hidden on small screens) */}
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-800 md:hidden">Inventory AI</h1>
            <p className="text-gray-500 text-sm text-center mb-6">Register your account</p>

            {/* Form wrapped inside a <form> tag for enter key input */}
            <form onSubmit={handleFormSubmit}>

              {/* Email input */}
              <div className="mb-4">
                <label htmlFor="register-email" className="sr-only">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="Email address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Username input */}
              <div className="mb-4">
                <label htmlFor="register-username" className="sr-only">Username</label>
                <input
                  id="register-username"
                  type="text"
                  placeholder="Username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password input */}
              <div className="mb-4">
                <label htmlFor="register-password" className="sr-only">Password</label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 animate-fadeIn">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password || !username}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition duration-200 shadow-sm"
              >
                {loading ? "Checking details..." : "Create Account"}
              </button>

            </form>

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default RegisterForm;