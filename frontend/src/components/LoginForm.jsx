import { useState } from "react";
import axios from "axios";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form submission handler (e.preventDefault() ke sath taaki page reload na ho)
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Browser ka default page refresh rokhne ke liye
    
    setLoading(true);
    setError(""); 

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim(), // User agar end mein galti se space de de, toh trim() use saaf kar dega
        password: password,
      });

      const token = response.data.token;
      onLogin(token); 
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">

        {/* Branding/Heading */}
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Inventory AI</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Sign in to your account</p>

        {/* Humanized Change: Wrapped inside a <form> tag for Enter-key support */}
        <form onSubmit={handleFormSubmit}>
          
          {/* Email input */}
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

          {/* Password input */}
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

          {/* Error Message Box */}
          {error && (
            <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 animate-fadeIn">
              {error}
            </div>
          )}

          {/* Submit Button */}
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