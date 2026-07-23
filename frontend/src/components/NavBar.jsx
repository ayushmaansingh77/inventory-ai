import brandlogo from "../assets/brandlogo.svg"

function NavBar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src={brandlogo} alt="StockMind" className="w-23 h-14" />
        <h1 className="text-xl font-bold text-gray-800"> StockMind</h1>
      </div>
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
  )
}

export default NavBar