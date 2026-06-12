import { useEffect, useState} from 'react'
import api from '../api/axios'
import { useAuth} from '../context/AuthContext'
import socket from '../sockets/socket'

function Notifications() {

  const { user } = useAuth()

  useEffect(() => {

  socket.on(
    'receive-notification',
    notification => {

      setNotifications(
        prev => [
          notification,
          ...prev
        ]
      )
    }
  )

  return () => {

    socket.off(
      'receive-notification'
    )
  }

}, [])

    useEffect(() => {

  if (!user)
    return

  fetchNotifications()

}, [user])

const fetchNotifications =
  async () => {

    try {

      const response =
        await api.get(
          `/rooms/notifications/${user.id}`
        )

      setNotifications(
        response.data
      )

    } catch (error) {

      console.log(error)
    }
  }

  const [
    notifications,
    setNotifications
  ] = useState([])

  return (

  <div>

  <h2 className="text-xl mb-3">
    Notifications
  </h2>

  {
    notifications.map(
      notification => (

        <div
          key={
            notification.id
          }
          className="
            border
            p-3
            mb-2
          "
        >

          <h3 className="font-bold">

            {
              notification.title
            }

          </h3>

          <p>

            {
              notification.message
            }

          </p>

        </div>
      )
    )
  }

</div>
  )
}

export default Notifications