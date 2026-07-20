import RegisterForm from "../components/RegisterForm"
import { useNavigate } from "react-router-dom"

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <RegisterForm
      onRegisterSuccess={() =>
        navigate("/login", {
          state: { message: "Registration successful! Please check your email to verify your account before logging in.ThankYou!!" }
        })
      }
    />
  )
}

export default RegisterPage