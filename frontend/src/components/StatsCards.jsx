import {
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

function StatsCards({ items, forecast, mostUrgentItem }) {
  const lowStockCount = items.filter(
    (item) => item.quantity <= item.reorder_level
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      {/* Total Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <h2 className="text-4xl font-bold text-gray-800 mt-2">
              {items.length}
            </h2>

            <p className="text-sm text-gray-500 mt-3">
              Products currently in inventory
            </p>
          </div>

          <div className="bg-blue-100 p-4 rounded-xl">
            <Package className="text-blue-600" size={30} />
          </div>
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Low Stock Alerts
            </p>

            <h2 className="text-4xl font-bold text-red-500 mt-2">
              {lowStockCount}
            </h2>

            <p className="text-sm text-gray-500 mt-3">
              Items that need attention
            </p>
          </div>

          <div className="bg-red-100 p-4 rounded-xl">
            <AlertTriangle className="text-red-600" size={30} />
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Tomorrow's Forecast
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-2">
              {forecast ? forecast[0].predicted_quantity : "--"}
            </h2>

            <p className="text-sm text-gray-500 mt-3">
              {mostUrgentItem
                ? `${mostUrgentItem.name}`
                : "No urgent items"}
            </p>
          </div>

          <div className="bg-green-100 p-4 rounded-xl">
            <TrendingUp className="text-green-600" size={30} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default StatsCards;