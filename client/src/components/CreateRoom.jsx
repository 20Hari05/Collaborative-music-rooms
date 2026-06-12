import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function CreateRoom() {

  const [roomName, setRoomName] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

 const createRoom = async () => {

  try {

    const response = await api.post(
      '/rooms/create',
      {
        room_name: roomName,
        host_id: user.id
      }
    )

    const room = response.data[0]

    console.log(room)

    navigate(
      `/room/${room.room_code}`
    )

  } catch (error) {

    console.log(error)
  }
}
  return (
    <div className="p-5 border">

      <input
        type="text"
        placeholder="Room Name"
        className="border p-2"
        onChange={(e) =>
          setRoomName(e.target.value)
        }
      />

      <button
        onClick={createRoom}
        className="bg-black text-white p-2 ml-2"
      >
        Create Room
      </button>

    </div>
  )
}

export default CreateRoom