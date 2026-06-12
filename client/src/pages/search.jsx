import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Search() {

  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])

  const { user: currentUser } = useAuth()

  const handleSearch = async () => {

    try {

      const response = await api.get(
        `/users/search?query=${query}`
      )

      setUsers(response.data)

    } catch (error) {
      console.log(error)
    }
  }

  const sendRequest = async (receiverId) => {

    try {

      await api.post('/friends/request', {
        sender_id: currentUser.id,
        receiver_id: receiverId
      })

      alert('Request sent')

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="p-10">

      <input
        type="text"
        placeholder="Search users"
        className="border p-2"
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="bg-black text-white p-2 ml-2"
      >
        Search
      </button>

      <div className="mt-5">

        {users.map((user) => (

          <div
            key={user.id}
            className="border p-3 mb-2"
          >

            <p>{user.email}</p>

            <button
              onClick={() => sendRequest(user.id)}
              className="bg-blue-500 text-white p-2 mt-2"
            >
              Send Request
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}

export default Search