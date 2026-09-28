import { useCallback, useRef, useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { ToastContext } from "../hooks/useToast"

const STYLES = {
  success: "bg-white border-green-200 text-green-800",
  error: "bg-white border-red-200 text-red-800",
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = "success") => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? CheckCircle2
          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-start gap-2 rounded-lg border shadow-md px-4 py-3 text-sm ${STYLES[toast.type] ?? STYLES.success}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <p className="flex-1">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-current opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
