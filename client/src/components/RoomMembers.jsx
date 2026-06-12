import {
  useEffect,
  useState
} from 'react'

import api from '../api/axios'

import socket from '../sockets/socket'

function RoomMembers({
  roomId
}) {

  const [members,
    setMembers] =
      useState([])

  useEffect(() => {

    if (!roomId)
      return

    fetchMembers()

  }, [roomId])

  useEffect(() => {

  if (!roomId)
    return

  socket.on(
    'user-joined',
    fetchMembers
  )

  socket.on(
    'user-left',
    fetchMembers
  )

  return () => {

    socket.off(
      'user-joined',
      fetchMembers
    )

    socket.off(
      'user-left',
      fetchMembers
    )
  }

}, [roomId])


const fetchMembers =
  async () => {

    console.log(
      "RoomMembers roomId:",
      roomId
    )

    try {
      const response =
        await api.get(
          `/rooms/presence/${roomId}`
        )

      setMembers(
        response.data
      )

    } catch (error) {

      console.log(error)
    }
  }

  return (

    <div className="mt-5">
<h2 className="text-xl mb-3">
  Online Members
</h2>
<p className="mb-2">

  {members.length}
  {' '}
  Online

</p>
      {
  members.length === 0 && (

    <p>
      No members online
    </p>
  )
}
      {
        members.map(
          (member) => (

           <p key={member.id}>
  {
    member.users?.username ||
    member.users?.email
  }
</p>
          )
        )
      }

    </div>
  )
}

export default RoomMembers