// frontend/src/components/Footer.jsx
function Footer() {
  return (
    <footer className="w-full py-4 px-8 border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} StockMind — Smart Inventory Management</p>
        
        <a
          href="https://github.com/ayushmaansingh77/inventory-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  )
}

export default Footer