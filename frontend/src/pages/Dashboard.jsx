import { useState, useEffect } from "react"
import api from "../api/axiosInstance"

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Standard Flask endpoint to fetch the logged-in user profile
        const response = await api.get("/auth/me") 
        
        // 2. Flask usually returns the user object directly or nested under a key
        setUser(response.data) // or response.data.user depending on your Flask return statement
      } catch (err) {
        console.error("Failed to fetch user:", err)
        onLogout() // token is invalid or expired — force logout
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">📦 Inventory AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {/* 3. Render whatever property your Flask model uses (e.g., username, email, or name) */}
            👋 Welcome, <span className="font-semibold">{user?.username}</span>
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Stat Card 1 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
            <p className="text-blue-500 text-xs mt-2">Week 2 → real data</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-red-500 mt-1">0</p>
            <p className="text-blue-500 text-xs mt-2">Week 2 → real data</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Demand Forecast</p>
            <p className="text-3xl font-bold text-green-500 mt-1">--</p>
            <p className="text-blue-500 text-xs mt-2">Week 2 → ML model</p>
          </div>

        </div>

        {/* Inventory Table Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Inventory Items</h2>
          <p className="text-gray-400 text-sm text-center py-8">
            No items yet — inventory CRUD coming in Week 2 🚀
          </p>
        </div>
      </div>

    </div>
  )
}

export default Dashboard