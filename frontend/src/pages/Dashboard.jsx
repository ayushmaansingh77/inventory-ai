import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import api from "../api/axiosInstance"
import { fetchItems, updateItem, deleteItem } from "../features/inventory/inventorySlice"
import AddItemForm from "../components/AddItemForm"
import Spinner from "../components/Spinner"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import StatsCards from "../components/StatsCards"
import LowStockPanel from "../components/LowStockPanel"
import InventoryTable from "../components/InventoryTable"
import ConfirmDialog from "../components/ConfirmDialog"
import ImportModal from "../components/ImportModal"
import { useToast } from "../hooks/useToast"
import { Upload, Download } from "lucide-react"

function Dashboard({ onLogout }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.inventory)
  const showToast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const mostUrgentItem = useMemo(() => {
    const lowStockItems = items.filter(
      (item) => item.quantity <= item.reorder_level
    )
    if (lowStockItems.length === 0) {
      return null
    }
    return lowStockItems.reduce((mostUrgent, current) => {
      const currentGap = current.quantity - current.reorder_level
      const urgentGap = mostUrgent.quantity - mostUrgent.reorder_level
      return currentGap < urgentGap ? current : mostUrgent
    })
  }, [items])

  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})


  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "asc" }
    })
  }

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
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const saveEdit = async (id) => {
    try {
      await dispatch(
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
      ).unwrap()
      showToast("Item updated.", "success")
    } catch (err) {
      showToast(err || "Failed to update item.", "error")
    }
    cancelEdit()
  }

  const handleDelete = (id) => {
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await dispatch(deleteItem(id)).unwrap()
      showToast("Item deleted.", "success")
    } catch (err) {
      showToast(err || "Failed to delete item.", "error")
    }
  }

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/inventory/export?format=${format}`, { responseType: "blob" })
      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = format === "xlsx" ? "inventory_export.xlsx" : "inventory_export.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      showToast("Failed to export inventory.", "error")
    }
  }

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

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])





  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm">Loading your dashboard...</p>
      </div>
    )
  }

  const visibleItems = [...items]
    .filter((item) => {
      const term = searchTerm.toLowerCase()
      return (
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term)
      )
    })
    .filter((item) => {
      if (!showLowStockOnly) return true
      return item.quantity <= item.reorder_level
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0
      const valueA = a[sortConfig.key]
      const valueB = b[sortConfig.key]
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto mt-8 px-4 flex-1 w-full">
        <StatsCards
          items={items}
          mostUrgentItem={mostUrgentItem}
        />

        <div className="flex flex-wrap justify-end gap-2 mb-2">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-2 text-sm font-semibold transition"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-2 text-sm font-semibold transition"
          >
            <Download size={16} />
            Export Excel
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-teal-700 text-teal-700 hover:bg-teal-50 px-4 py-2 text-sm font-semibold transition"
          >
            <Upload size={16} />
            Import from Excel/CSV
          </button>
        </div>

        <AddItemForm />

        <LowStockPanel items={items} />

        <InventoryTable
          items={items}
          status={status}
          error={error}
          visibleItems={visibleItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showLowStockOnly={showLowStockOnly}
          setShowLowStockOnly={setShowLowStockOnly}
          sortConfig={sortConfig}
          handleSort={handleSort}
          editingId={editingId}
          editData={editData}
          handleEditChange={handleEditChange}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          handleDelete={handleDelete}
        />
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this item?"
        message="This will permanently remove the item and its sales history. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />

      <Footer />
    </div>
  )
}

export default Dashboard