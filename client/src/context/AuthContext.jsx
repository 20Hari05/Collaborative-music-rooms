import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../services/supabase'
import socket from '../sockets/socket'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const getSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }

  }, [])

  useEffect(() => {

  if (!user)
    return

  socket.emit(
    'register-user',
    user.id
  )

  console.log(
    'Registered User:',
    user.id
  )

}, [user])

  const value = {
    user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)