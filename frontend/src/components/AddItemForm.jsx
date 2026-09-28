import { useState } from "react"
import { useDispatch } from "react-redux"
import { addItem } from "../features/inventory/inventorySlice"
import { useToast } from "../hooks/useToast"

function AddItemForm() {
  const dispatch = useDispatch()
  const showToast = useToast()

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "",
    unit_price: "",
    reorder_level: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleChange = (e) => {
   setFormData({
    ...formData,[e.target.name]: e.target.value,
   })
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // prevents the default full-page-reload browser form submit

    setSubmitting(true)
    setSubmitError("")

    try {
      await dispatch(
        addItem({
          name: formData.name,
          sku: formData.sku,
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unit_price),
          reorder_level: Number(formData.reorder_level),
        })
      ).unwrap()

      // only clear the form once the item was actually created
      setFormData({
        name: "",
        sku: "",
        quantity: "",
        unit_price: "",
        reorder_level: "",
      })
      showToast("Item added.", "success")
    } catch (err) {
      setSubmitError(err || "Failed to add item")
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <div>
        <label htmlFor="item-name" className="sr-only">Item name</label>
        <input
          id="item-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Item name"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="item-sku" className="sr-only">SKU</label>
        <input
          id="item-sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="SKU"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="item-quantity" className="sr-only">Quantity</label>
        <input
          id="item-quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="item-unit-price" className="sr-only">Unit price</label>
        <input
          id="item-unit-price"
          name="unit_price"
          type="number"
          step="0.01"
          value={formData.unit_price}
          onChange={handleChange}
          placeholder="Unit price"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="item-reorder-level" className="sr-only">Reorder level</label>
        <input
          id="item-reorder-level"
          name="reorder_level"
          type="number"
          value={formData.reorder_level}
          onChange={handleChange}
          placeholder="Reorder level"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      {submitError && (
        <p className="col-span-1 sm:col-span-2 md:col-span-5 text-red-600 text-sm -mb-1">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="col-span-1 sm:col-span-2 md:col-span-5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-semibold transition"
      >
        {submitting ? "Adding..." : "Add Item"}
      </button>
    </form>
  )
}

export default AddItemForm