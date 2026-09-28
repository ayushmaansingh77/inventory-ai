import { useEffect, useRef } from "react"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Escape-to-close, a basic Tab focus trap, and restoring focus to whatever
// was focused before the modal opened. Attach `ref` to the modal's outer
// container. `active` lets callers conditionally mount a modal without
// having to unmount the hook itself.
export function useModalA11y(onClose, active = true) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const previouslyFocused = document.activeElement
    containerRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.()
        return
      }

      if (e.key !== "Tab" || !containerRef.current) return

      const focusable = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [active, onClose])

  return containerRef
}
