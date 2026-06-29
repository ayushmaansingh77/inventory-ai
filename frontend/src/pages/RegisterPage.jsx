import RegisterForm from "../components/RegisterForm"
import { useNavigate } from "react-router-dom"

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <RegisterForm onRegisterSuccess={() => navigate("/login")} />
    // Successful registration ke baad user login karke token generate karega
  )
}

export default RegisterPage