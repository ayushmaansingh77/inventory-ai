import { useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { Upload, X } from "lucide-react"
import api from "../api/axiosInstance"
import { fetchItems } from "../features/inventory/inventorySlice"
import { useModalA11y } from "../hooks/useModalA11y"
import { useToast } from "../hooks/useToast"

// key: our InventoryItem field. hints: substrings we look for (case-insensitive)
// in the spreadsheet's own header row to guess which column maps to it.
const FIELDS = [
  { key: "name", label: "Item Name", required: true, hints: ["name", "product", "item", "title"] },
  { key: "sku", label: "SKU", required: true, hints: ["sku", "code"] },
  { key: "quantity", label: "Quantity", required: true, hints: ["qty", "quantity", "stock", "count"] },
  { key: "unit_price", label: "Unit Price", required: true, hints: ["price", "cost"] },
  { key: "reorder_level", label: "Reorder Level", required: false, hints: ["reorder", "threshold", "min"] },
]

function guessMapping(headers) {
  const mapping = {}
  for (const field of FIELDS) {
    const match = headers.find((h) =>
      field.hints.some((hint) => h.toLowerCase().includes(hint))
    )
    mapping[field.key] = match || ""
  }
  return mapping
}

const TEMPLATE_EXAMPLE_ROW = ["Sample Widget", "SKU-001", "25", "9.99", "10"]

function downloadTemplate() {
  const header = FIELDS.map((f) => f.label).join(",")
  const csv = `${header}\n${TEMPLATE_EXAMPLE_ROW.join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "stockmind_import_template.csv"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const STEPS = { PICK: "pick", MAP: "map", DONE: "done" }

function ImportModal({ open, onClose }) {
  const dispatch = useDispatch()
  const showToast = useToast()
  const modalRef = useModalA11y(onClose, open)

  const [step, setStep] = useState(STEPS.PICK)
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [sampleRows, setSampleRows] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [mapping, setMapping] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState(null)

  const reset = () => {
    setStep(STEPS.PICK)
    setFile(null)
    setHeaders([])
    setSampleRows([])
    setRowCount(0)
    setMapping({})
    setError("")
    setSummary(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setError("")
    setLoading(true)
    setFile(selected)

    try {
      const formData = new FormData()
      formData.append("file", selected)
      const res = await api.post("/inventory/import/preview", formData)
      setHeaders(res.data.headers)
      setSampleRows(res.data.sample_rows)
      setRowCount(res.data.row_count)
      setMapping(guessMapping(res.data.headers))
      setStep(STEPS.MAP)
    } catch (err) {
      setError(err.response?.data?.error || "Could not read that file.")
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  const missingRequired = useMemo(
    () => FIELDS.filter((f) => f.required && !mapping[f.key]),
    [mapping]
  )

  const handleImport = async () => {
    if (missingRequired.length > 0 || !file) return

    setLoading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mapping", JSON.stringify(mapping))
      const res = await api.post("/inventory/import/commit", formData)
      setSummary(res.data)
      setStep(STEPS.DONE)
      dispatch(fetchItems())
      showToast(`Imported ${res.data.created} item${res.data.created === 1 ? "" : "s"}.`, "success")
    } catch (err) {
      setError(err.response?.data?.error || "Import failed.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 sm:px-8 py-5 border-b">
          <h2 id="import-modal-title" className="text-xl font-bold">Import from Excel/CSV</h2>
          <button onClick={handleClose} aria-label="Close import dialog" className="rounded-full hover:bg-gray-100 p-2">
            <X />
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-5">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
          )}

          {step === STEPS.PICK && (
            <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl py-12 px-4 text-center">
              <Upload className="text-gray-400" size={32} />
              <p className="text-gray-600 text-sm">Upload a .csv or .xlsx file of inventory items</p>
              <label className="cursor-pointer bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                {loading ? "Reading file..." : "Choose File"}
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-teal-700 hover:underline text-xs font-medium"
              >
                Download a sample template
              </button>
            </div>
          )}

          {step === STEPS.MAP && (
            <>
              <p className="text-sm text-gray-500">
                Found {rowCount} row{rowCount === 1 ? "" : "s"} in <span className="font-medium">{file?.name}</span>.
                Match each field to a column from your file.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`map-${field.key}`} className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      {field.label}{field.required && " *"}
                    </label>
                    <select
                      id={`map-${field.key}`}
                      value={mapping[field.key] || ""}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">— Not mapped —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {sampleRows.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleRows.map((row, i) => (
                        <tr key={i} className="border-t">
                          {headers.map((h) => (
                            <td key={h} className="px-3 py-2 text-gray-700">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={reset}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Choose a different file
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading || missingRequired.length > 0}
                  className="rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white"
                >
                  {loading ? "Importing..." : `Import ${rowCount} Row${rowCount === 1 ? "" : "s"}`}
                </button>
              </div>
              {missingRequired.length > 0 && (
                <p className="text-xs text-amber-600">
                  Still need: {missingRequired.map((f) => f.label).join(", ")}
                </p>
              )}
            </>
          )}

          {step === STEPS.DONE && summary && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="text-green-800 font-semibold">
                  {summary.created} item{summary.created === 1 ? "" : "s"} imported.
                </p>
              </div>

              {summary.skipped_duplicate_skus.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm">
                  <p className="text-amber-800 font-semibold mb-1">
                    Skipped {summary.skipped_duplicate_skus.length} duplicate SKU{summary.skipped_duplicate_skus.length === 1 ? "" : "s"}:
                  </p>
                  <p className="text-amber-700">{summary.skipped_duplicate_skus.join(", ")}</p>
                </div>
              )}

              {summary.row_errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm">
                  <p className="text-red-800 font-semibold mb-1">
                    {summary.row_errors.length} row{summary.row_errors.length === 1 ? "" : "s"} had errors:
                  </p>
                  <ul className="text-red-700 space-y-0.5">
                    {summary.row_errors.map((e, i) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={reset}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Import Another File
                </button>
                <button
                  onClick={handleClose}
                  className="rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2 text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportModal
