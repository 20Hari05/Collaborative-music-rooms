import { useState } from 'react'
import supabase from '../services/supabase'
import { useNavigate } from 'react-router-dom'

function Signup() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const handleSignup = async (e) => {

    e.preventDefault()

    setMessage('')

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    console.log('Signup Data:', data)

    // Auth signup failed
    if (error) {

      console.log('Signup Error:', error)

      setMessage(error.message)

      return
    }

    // Safety check
    if (!data.user) {

      setMessage(
        'Signup successful. Please verify your email.'
      )

      return
    }

    // Insert user into custom users table
    const {
      data: insertedUser,
      error: insertError
    } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          username: null
        }
      ])
      .select()

    console.log('Inserted User:', insertedUser)

    // Database insert failed
    if (insertError) {

      console.log(
        'FULL INSERT ERROR:',
        JSON.stringify(insertError, null, 2)
      )

      setMessage(insertError.message)

      return
    }

    console.log('User inserted successfully')

    setMessage('Signup successful')
    setTimeout(() => {
  navigate('/dashboard')
}, 1000)
  }

  return (
    <div className="p-10">

      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 max-w-md"
      >

        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-black text-white p-2">
          Signup
        </button>

        <p>{message}</p>

      </form>

    </div>
  )
}

export default Signup