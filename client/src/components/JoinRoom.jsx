import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function JoinRoom() {

  const [roomCode, setRoomCode] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()
const joinRoom = async () => {

  try {

    const response = await api.post(
      '/rooms/join',
      {
        room_code: roomCode,
        user_id: user.id
      }
    )

    const room = response.data

    console.log(room)

    navigate(
      `/room/${room.room_code}`
    )

  } catch (error) {

    console.log(error)
  }
}
  return (
    <div className="p-5 border mt-5">

      <input
        type="text"
        placeholder="Room Code"
        className="border p-2"
        onChange={(e) =>
          setRoomCode(e.target.value)
        }
      />

      <button
        onClick={joinRoom}
        className="bg-blue-500 text-white p-2 ml-2"
      >
        Join Room
      </button>

    </div>
  )
}

export default JoinRoom