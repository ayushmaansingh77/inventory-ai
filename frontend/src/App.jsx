import { useState } from "react"
import { Provider } from "react-redux"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { store } from "./app/store"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import VerifyEmailPage from "./pages/VerifyEmailPage"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")

  const handleLogin = (token) => {
    localStorage.setItem("token", token)
    setToken(token)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken("")
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
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
    </Provider>
  )
}

export default App