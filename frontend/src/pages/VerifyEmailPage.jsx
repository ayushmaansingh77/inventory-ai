import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import api from "../api/axiosInstance"

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState("verifying") // "verifying" | "success" | "error"
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error")
        setMessage("No verification token found in the link.")
        return
      }

      try {
        const response = await api.get(`/auth/verify/${token}`)
        setStatus("success")
        setMessage(response.data.message)
      } catch (err) {
        setStatus("error")
        setMessage(err.response?.data?.error || "Verification failed.")
      }
    }

    verify()
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
        {status === "verifying" && <p className="text-gray-500">Verifying your email...</p>}
        {status === "success" && (
          <>
            <p className="text-green-600 font-semibold mb-4">{message}</p>
            <Link to="/login" className="text-blue-500 underline">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <p className="text-red-600">{message}</p>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage