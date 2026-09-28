import { useState } from "react"
import api from "../api/axiosInstance"
import { useToast } from "../hooks/useToast"

function LowStockPanel({ items }) {
  const showToast = useToast()
  const [sending, setSending] = useState(false)
  const lowStockItems = items.filter((item) => item.quantity <= item.reorder_level)

  if (lowStockItems.length === 0) return null

  const handleEmailReport = async () => {
    setSending(true)
    try {
      const res = await api.post("/inventory/alerts/low-stock")
      showToast(`Low-stock report emailed (${res.data.item_count} item${res.data.item_count === 1 ? "" : "s"}).`, "success")
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send low-stock report.", "error")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">⚠️ Needs Reordering</h2>
        <button
          onClick={handleEmailReport}
          disabled={sending}
          className="text-teal-700 hover:underline text-sm font-medium disabled:opacity-50"
        >
          {sending ? "Sending..." : "Email me this report"}
        </button>
      </div>
      <div className="space-y-2">
        {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b last:border-0 py-2 text-sm"
          >
            <span className="font-medium text-gray-800">{item.name}</span>
            <span className="text-gray-500">
              {item.quantity} / {item.reorder_level} reorder level
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.quantity === 0
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {item.quantity === 0 ? "Out of stock" : "Low stock"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LowStockPanel