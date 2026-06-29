import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  // Initialize token from localStorage so refresh doesn't log user out
  const [token, setToken] = useState(localStorage.getItem("token") || "")

  const handleLogin = (token) => {
    localStorage.setItem("token",token)  // save to localStorage
    setToken(token)                      // update React state
  }

  const handleLogout = () => {
    localStorage.removeItem("token")  // clear from localStorage
    setToken("")                  // reset React state
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App