import brandlogo from "../assets/brandlogo.svg"

function NavBar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-sm px-4 sm:px-8 py-3 sm:py-4 flex flex-wrap gap-3 justify-between items-center">
      <div className="flex items-center gap-2 min-w-0">
        <img src={brandlogo} alt="StockMind" className="w-14 h-9 sm:w-23 sm:h-14 shrink-0" />
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate"> StockMind</h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-gray-600 text-sm hidden sm:inline truncate max-w-[12rem]">
          Welcome, <span className="font-semibold">{user?.username}</span>
        </span>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default NavBar