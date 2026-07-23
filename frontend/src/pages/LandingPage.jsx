import { Link } from "react-router-dom"
import Footer from "../components/Footer"
import FloatingBox from "../components/FloatingBox"
import { useMemo } from "react";
import brandlogo from "../assets/brandlogo.svg"
const features = [
  {
    title: "Real-Time Inventory Tracking",
    description: "Add, edit, and track stock levels across all your products with instant search, sort, and filtering.",
    color: "bg-teal-100 text-teal-700",
  },
  {
    title: "ML-Powered Demand Forecasting",
    description: "Predict future sales using a linear regression baseline and an LSTM neural network, trained on your own sales history.",
    color: "bg-orange-100 text-orange-700",
  },
  {
    title: "Low-Stock Alerts",
    description: "Automatically flags items at or below their reorder point, so you never run out unexpectedly.",
    color: "bg-teal-100 text-teal-700",
  },
  {
    title: "Secure, Per-User Accounts",
    description: "Email verification and JWT-based authentication keep your inventory data private and protected.",
    color: "bg-orange-100 text-orange-700",
  },
]

function LandingPage() {
    const floatingBoxes = useMemo(
  () =>
    Array.from({ length: 30 }, () => ({
      size: 15 + Math.random() * 45,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2 - 1,
      rotate: Math.random() * 360,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 3,
    })),
  []
);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="px-8 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={brandlogo} alt="StockMind" className="w-10 h-10" />
          <span className="text-xl font-bold text-gray-800">StockMind</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto overflow-hidden"
        style={{ perspective: "1000px" }}
      >
      {/* Left Flank */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  {floatingBoxes.map((box, index) => (
    <FloatingBox key={index} {...box} />
  ))}
</div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Inventory management that{" "}
            <span className="bg-gradient-to-r from-teal-700 to-orange-500 bg-clip-text text-transparent">
              predicts what's next.
            </span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl">
            Track stock, catch low inventory before it's a problem, and forecast
            demand with real machine learning — not guesswork.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Everything you need to stay ahead of stockouts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center font-bold mb-4`}>
                  {feature.title.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to take control of your inventory?
        </h2>
        <Link
          to="/register"
          className="inline-block bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
        >
          Get Started — It's Free
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage