import { useEffect, useState} from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
function PendingInvites() {
  const { user } = useAuth()
  const [ invites, setInvites ] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
  if (!user)
    return

  fetchInvites()

}, [user])

const fetchInvites =
  async () => {
    try {
      const response = await api.get(`/rooms/invites/${user.id}`)
      setInvites( response.data )
    }
     catch (error) {
      console.log(error)
    }
  }

  const acceptInvite =
  async (invite) => {
    try {

      await api.post(
        '/rooms/invite/accept',
        {
          inviteId:
            invite.id
        }
      )

     navigate(`/room/${invite.rooms.room_code}`)

    } catch (error) {

      console.log(error)
    }
  }

  const rejectInvite =
  async (invite) => {

    try {

      await api.post(
        '/rooms/invite/reject',
        {
          inviteId:
            invite.id
        }
      )

      fetchInvites()

    } catch (error) {

      console.log(error)
    }
  }

  return (
   <div>

  <h2 className="text-xl mb-3">
    Pending Invites
  </h2>

  {
  invites.length === 0 && (

    <p>
      No pending invites
    </p>

  )
}
  {
    invites.map(
      invite => (

        <div
          key={invite.id}
          className="
            border
            p-3
            mb-2
          "
        >

          <h3>

            {
              invite.rooms
                ?.room_name
            }

          </h3>
          <button
  onClick={() =>
    acceptInvite(invite)
  }
  className="
    bg-green-500
    text-white
    px-3
    py-1
    mr-2
  "
>
  Accept
</button>
<button
  onClick={() =>
    rejectInvite(invite)
  }
  className="
    bg-red-500
    text-white
    px-3
    py-1
  "
>
  Reject
</button>

        </div>
      )
    )
  }
  </div>
  )
}

export default PendingInvites