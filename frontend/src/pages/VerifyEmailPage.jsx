import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import api from "../api/axiosInstance"
import Spinner from "../components/Spinner"
import Footer from "../components/Footer"

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState("verifying")
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-gray-500">Verifying your email...</p>
            </div>
          )}
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
      <Footer />
    </div>
  )
}

export default VerifyEmailPage