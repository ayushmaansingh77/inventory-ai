function Dashboard({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800"> Inventory AI</h1>
        <button
          onClick={onLogout} // <--- Yahan direct callback pass hoga
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-200"
        >
          Logout
        </button>
      </nav>
      <div className="flex items-center justify-center mt-20">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to your Dashboard</h2>
          <p className="text-gray-500">Inventory features coming in Week 2 🚀</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard