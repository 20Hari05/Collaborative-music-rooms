import { useEffect , useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import supabase from '../services/supabase'
import api from '../api/axios'
import socket from '../sockets/socket'

import CreateRoom from '../components/CreateRoom'
import JoinRoom from '../components/JoinRoom'
import Notifications from '../components/Notifications'
import PendingInvites from '../components/PendingInvites'

function Dashboard() {

  const { user } = useAuth()
  const [selectedSong, setSelectedSong] =useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {

    const testProtectedRoute = async () => {

      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        console.log('No active session')
        return
      }

      const token = session.access_token

      try {

        const response = await api.get('/protected', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        console.log(response.data)

      } catch (error) {
        console.log(error)
      }

    }

    testProtectedRoute()

  }, [])

  const handleLogout = async () => {

    const { error } = await supabase.auth.signOut({
      scope: 'global'
    })

    if (error) {
      console.log(error)
      return
    }

    socket.disconnect()

    localStorage.clear()

    sessionStorage.clear()

    window.location.href = '/login'
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl">
        Welcome
      </h1>

      <p>{user?.email}</p>

      <div className="mt-5">

  <Notifications />

</div>

<div className="mt-5">

  <PendingInvites />

</div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white p-2 mt-5"
      >
        Logout
      </button>
<div className="mt-10">
  <CreateRoom
    onRoomCreated={setCurrentRoom}
  />
</div>

<div className="mt-5">
  <JoinRoom
    onRoomJoined={setCurrentRoom}
  />
</div>

{
  currentRoom && (
    <>
      <div className="mt-5 p-3 border">

        <h2 className="text-xl font-bold">
          Current Room
        </h2>

        <p>
          {currentRoom.room_name}
        </p>

        <p>
          Code: {currentRoom.room_code}
        </p>

      </div>

      <div className="mt-5">
        <SongLibrary
          room={currentRoom}
          onSelectSong={setSelectedSong}
        />
      </div>

      <div className="mt-5">
        <AudioPlayer
          room={currentRoom}
          song={selectedSong}
        />
      </div>
    </>
  )
}
    </div>
  )
}

export default Dashboard