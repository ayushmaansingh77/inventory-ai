function LowStockPanel({ items }) {
  const lowStockItems = items.filter((item) => item.quantity <= item.reorder_level)

  if (lowStockItems.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Needs Reordering</h2>
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