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

function Dashboard({ onLogout }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.inventory)

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

      <Footer />
    </div>
  )
}

export default Dashboard