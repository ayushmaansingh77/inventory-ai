// frontend/src/components/Spinner.jsx
function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
  }

  return (
    <div
      className={`inline-block ${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export default Spinner