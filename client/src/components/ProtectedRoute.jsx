import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {

  const { user, loading } = useAuth()

  console.log('ProtectedRoute User:', user)

  // Wait until auth check finishes
  if (loading) {
    return <div>Loading...</div>
  }

  // Redirect if user not logged in
  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  // Allow protected page
  return children
}

export default ProtectedRoute