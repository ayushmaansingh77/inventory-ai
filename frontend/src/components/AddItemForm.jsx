import { useState } from "react"
import { useDispatch } from "react-redux"
import { addItem } from "../features/inventory/inventorySlice"

function AddItemForm() {
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "",
    unit_price: "",
    reorder_level: "",
  })

  const handleChange = (e) => {
   setFormData({
    ...formData,[e.target.name]: e.target.value,
   })
  }

  const handleSubmit = (e) => {
    e.preventDefault() // TODO: why is this needed? (hint: default browser form behavior)

   
dispatch(addItem({
    name:formData.name,
    sku:formData.sku,
    quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price),
        reorder_level: Number(formData.reorder_level),
      })
    )
//clearing the form after submitting on e instance
   setFormData({
      name: "",
      sku: "",
      quantity: "",
      unit_price: "",
      reorder_level: "",
    })
  }

  


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Item name"
        className="border rounded-lg px-3 py-2 text-sm"
        required
      />
      <input
        name="sku"
        value={formData.sku}
        onChange={handleChange}
        placeholder="SKU"
        className="border rounded-lg px-3 py-2 text-sm"
        required
      />
      <input
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        className="border rounded-lg px-3 py-2 text-sm"
        required
      />
      <input
        name="unit_price"
        type="number"
        step="0.01"
        value={formData.unit_price}
        onChange={handleChange}
        placeholder="Unit price"
        className="border rounded-lg px-3 py-2 text-sm"
        required
      />
      <input
        name="reorder_level"
        type="number"
        value={formData.reorder_level}
        onChange={handleChange}
        placeholder="Reorder level"
        className="border rounded-lg px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="col-span-2 md:col-span-5 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition"
      >
        Add Item
      </button>
    </form>
  )
}

export default AddItemForm