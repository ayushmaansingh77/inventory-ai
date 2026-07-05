import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import api from "../api/axiosInstance"
import { fetchItems } from "../features/inventory/inventorySlice"
import AddItemForm from "../components/AddItemForm"

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.inventory)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me")
        setUser(response.data)
      } catch (err) {
        console.error("Failed to fetch user:", err)
        onLogout()
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Fetch inventory items on mount — separate effect, separate concern from user auth
  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

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

          {/* Stat Card 1    */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{items.length}</p>
            <p className="text-blue-500 text-xs mt-2">Live from Redux</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-red-500 mt-1">
              {items.filter((item) => item.quantity <= item.reorder_level).length}
            </p>
            <p className="text-blue-500 text-xs mt-2">Live from Redux</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Demand Forecast</p>
            <p className="text-3xl font-bold text-green-500 mt-1">--</p>
            <p className="text-blue-500 text-xs mt-2">Week 3 → ML model</p>
          </div>

        </div>
            <AddItemForm />  

        {/* Inventory Table — now driven by Redux state */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Inventory Items</h2>

          {status === "loading" && (
            <p className="text-gray-400 text-sm text-center py-8">Loading items...</p>
          )}

          {status === "failed" && (
            <p className="text-red-500 text-sm text-center py-8">Error: {error}</p>
          )}

          {status === "succeeded" && items.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              No items yet — add your first item soon 🚀
            </p>
          )}

          {status === "succeeded" && items.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.sku}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">${item.unit_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard