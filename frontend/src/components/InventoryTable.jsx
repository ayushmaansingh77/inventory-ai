import { useState } from "react";
import ForecastModal from "./ForecastModal";
import api from "../api/axiosInstance";

function InventoryTable({
  items,
  status,
  error,
  visibleItems,
  searchTerm,
  setSearchTerm,
  showLowStockOnly,
  setShowLowStockOnly,
  sortConfig,
  handleSort,
  editingId,
  editData,
  handleEditChange,
  startEdit,
  cancelEdit,
  saveEdit,
  handleDelete,
}) {
  const [saleInputs, setSaleInputs] = useState({});
  const [saleStatus, setSaleStatus] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSaleInputChange = (itemId, value) => {
    setSaleInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleLogSale = async (itemId) => {
    const quantity = Number(saleInputs[itemId]);
    if (!quantity || quantity <= 0) return;

    setSaleStatus((prev) => ({ ...prev, [itemId]: "saving" }));
    try {
      await api.post(`/inventory/${itemId}/sales`, { quantity_sold: quantity });
      setSaleStatus((prev) => ({ ...prev, [itemId]: "saved" }));
      setSaleInputs((prev) => ({ ...prev, [itemId]: "" }));
    } catch (err) {
      setSaleStatus((prev) => ({ ...prev, [itemId]: "error" }));
    }
  };

  return (
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

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Name or SKU"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
          />
          Low Stock Only
        </label>
      </div>

      {status === "succeeded" && visibleItems.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-gray-600 text-sm uppercase tracking-wide">
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Quantity</th>
                <th
                  onClick={() => handleSort("unit_price")}
                  className="px-6 py-4 text-left cursor-pointer hover:text-teal-600 transition"
                >
                  Price
                  {sortConfig.key === "unit_price" &&
                    (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                </th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleItems.map((item) => {
                // Renamed from status to stockStatus to avoid variable shadowing
                const stockStatus =
                  item.quantity === 0
                    ? "out"
                    : item.quantity <= item.reorder_level
                    ? "low"
                    : "healthy";

                return (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition duration-200"
                  >
                    {editingId === item.id ? (
                      <>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <input
                              type="text"
                              name="name"
                              value={editData.name}
                              onChange={handleEditChange}
                              className="w-full rounded-lg border px-3 py-2"
                            />
                            <input
                              type="text"
                              name="sku"
                              value={editData.sku}
                              onChange={handleEditChange}
                              className="w-full rounded-lg border px-3 py-2"
                            />
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <input
                            type="number"
                            name="quantity"
                            value={editData.quantity}
                            onChange={handleEditChange}
                            className="w-28 rounded-lg border px-3 py-2"
                          />
                        </td>

                        <td className="px-6 py-5">
                          <input
                            type="number"
                            step="0.01"
                            name="unit_price"
                            value={editData.unit_price}
                            onChange={handleEditChange}
                            className="w-28 rounded-lg border px-3 py-2"
                          />
                        </td>

                        <td className="px-6 py-5">—</td>

                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 font-medium">
                          {item.quantity}
                        </td>

                        <td className="px-6 py-5 font-medium">
                          ${Number(item.unit_price).toFixed(2)}
                        </td>

                        <td className="px-6 py-5">
                          {stockStatus === "healthy" && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Healthy
                            </span>
                          )}

                          {stockStatus === "low" && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Low Stock
                            </span>
                          )}

                          {stockStatus === "out" && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="rounded-lg border border-yellow-400 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-700 hover:bg-yellow-100"
                            >
                              Edit
                            </button>

                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                placeholder="Qty sold"
                                value={saleInputs[item.id] || ""}
                                onChange={(e) =>
                                  handleSaleInputChange(item.id, e.target.value)
                                }
                                className="w-20 border rounded px-2 py-1 text-xs"
                              />
                              <button
                                onClick={() => handleLogSale(item.id)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded text-xs transition"
                              >
                                {saleStatus[item.id] === "saving" ? "..." : "Log Sale"}
                              </button>
                              {saleStatus[item.id] === "saved" && (
                                <span className="text-green-600 text-xs font-bold">✓</span>
                              )}
                              {saleStatus[item.id] === "error" && (
                                <span className="text-red-600 text-xs font-bold">✗</span>
                              )}
                            </div>

                            <button
                              onClick={() => setSelectedItem(item)}
                              className="rounded-lg border border-blue-400 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                            >
                              Forecast
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg border border-red-400 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <ForecastModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default InventoryTable;
//written self error and bug fixed with claude code....