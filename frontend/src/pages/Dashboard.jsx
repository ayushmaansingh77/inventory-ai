import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import api from "../api/axiosInstance"
import { fetchItems, updateItem, deleteItem } from "../features/inventory/inventorySlice"
import AddItemForm from "../components/AddItemForm"

function Dashboard({ onLogout }) {
//filtering based on search
// Stores whatever the user types into the search box.
// Local UI state -> does NOT belong in Redux because
// only Dashboard cares about it.
const [searchTerm, setSearchTerm] = useState("")
const [showLowStockOnly, setShowLowStockOnly] = useState(false)
const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })


  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.inventory)

  // Which row is currently being edited. null = no row
  const [editingId, setEditingId] = useState(null)

  // Stores the temporary edited values.
  const [editData, setEditData] = useState({})
  ///sorting and fileterning the colums that is handler funcions
  // ====================================
// Handles clicking a sortable column.
// ====================================
const handleSort = (key) => {

  // Functional update ensures we always
  // work with the latest state.
  setSortConfig((prev) => {

    // If the user clicks the SAME column...
    if (prev.key === key) {

      // Flip between ascending and descending.
      return {
        key,
        direction:
          prev.direction === "asc"
            ? "desc"
            : "asc",
      };
    }

    // If the user clicked a DIFFERENT column,
    // start sorting that column in ascending order.
    return {
      key,
      direction: "asc",
    };
  });
};

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditData({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      reorder_level: item.reorder_level,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    })
  }

  const saveEdit = (id) => {
    dispatch(
      updateItem({
        id,
        data: {
          name: editData.name,
          sku: editData.sku,
          quantity: Number(editData.quantity),
          unit_price: Number(editData.unit_price),
          reorder_level: Number(editData.reorder_level),
        },
      })
    )
    cancelEdit()
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm("Delete this item?")
    if (!confirmed) return
    dispatch(deleteItem(id))
  }

  // Fetch logged-in user on mount
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

  // Single loading check, placed AFTER all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
  
const visibleItems = [...items].filter((item) => {

    // Convert search to lowercase so searching
    // is case-insensitive.
    const term = searchTerm.toLowerCase();

    // Keep an item if either its name
    // OR SKU contains the search text.
    return (
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term)
    );
  })

 
  // LOW STOCK FILTER
 
  .filter((item) => {

    // If the checkbox is OFF,
    // keep every item.
    if (!showLowStockOnly)
      return true;

    // Otherwise only keep items whose
    // quantity has fallen to or below
    // their reorder level.
    return item.quantity <= item.reorder_level;
  })

  // =============================
  // SORTING
  // =============================
  .sort((a, b) => {

    // No column selected?
    // Keep original order.
    if (!sortConfig.key)
      return 0;

    // Get the value of whichever
    // property we're sorting.
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    // Ascending
    if (valueA < valueB)
      return sortConfig.direction === "asc"
        ? -1
        : 1;

    // Descending
    if (valueA > valueB)
      return sortConfig.direction === "asc"
        ? 1
        : -1;

    // Equal values
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">StockMind</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            Welcome, <span className="font-semibold">{user?.username}</span>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{items.length}</p>
            <p className="text-blue-500 text-xs mt-2">Live from Redux</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-red-500 mt-1">
              {items.filter((item) => item.quantity <= item.reorder_level).length}
            </p>
            <p className="text-blue-500 text-xs mt-2">Live from Redux</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Demand Forecast</p>
            <p className="text-3xl font-bold text-green-500 mt-1">--</p>
            <p className="text-blue-500 text-xs mt-2">Week 3 → ML model</p>
          </div>
        </div>

        <AddItemForm />
        {items.filter((item) => item.quantity <= item.reorder_level).length > 0 && (
  <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Needs Reordering</h2>
    <div className="space-y-2">
      {items
        .filter((item) => item.quantity <= item.reorder_level)
        .map((item) => (
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
)}

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

          {/* ===============================
     SEARCH + LOW STOCK FILTER
================================ */}
<div className="flex gap-4 mb-4">

  {/* Search Box */}
  <input
    type="text"

    placeholder="Search by Name or SKU"

    // Controlled component.
    // Value always comes from React state.
    value={searchTerm}

    // Every key press updates searchTerm.
    onChange={(e) => setSearchTerm(e.target.value)}

    className="flex-1 border rounded-lg px-3 py-2"
  />

  {/* Low Stock Toggle */}
  <label className="flex items-center gap-2">

    <input
      type="checkbox"

      checked={showLowStockOnly}

      onChange={(e) =>
        setShowLowStockOnly(e.target.checked)
      }
    />

    Low Stock Only

  </label>

</div>

          {status === "succeeded" && visibleItems.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">SKU</th>
                  <th
  className="cursor-pointer select-none"

  // Clicking the header sorts the column.
  onClick={() => handleSort("quantity")}
>

  Quantity

  {/* Show sorting arrow only if this
      column is currently selected.
  */}
  {sortConfig.key === "quantity" &&
    (sortConfig.direction === "asc"
      ? " ↑"
      : " ↓")}

</th>
                  <th
  className="cursor-pointer select-none"
  onClick={() => handleSort("unit_price")}
>

  Price

  {sortConfig.key === "unit_price" &&
    (sortConfig.direction === "asc"
      ? " ↑"
      : " ↓")}

</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    {editingId === item.id ? (
                      <>
                        <td className="py-2">
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="text"
                            name="sku"
                            value={editData.sku}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            name="quantity"
                            value={editData.quantity}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            step="0.01"
                            name="unit_price"
                            value={editData.unit_price}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.sku}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">${item.unit_price}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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