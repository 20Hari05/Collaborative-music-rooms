import { useState } from 'react'
import supabase from '../services/supabase'
import { useNavigate } from 'react-router-dom'
function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log(error)
    } 
    navigate('/dashboard')
  }

  return (
    <div className="p-10">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-md">

        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-black text-white p-2">
          Login
        </button>

        <p>{message}</p>

      </form>
    </div>
  )
}

export default Login