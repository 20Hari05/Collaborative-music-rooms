import { useEffect, useState,useRef} from 'react'

import api from '../api/axios'
import socket from '../sockets/socket'
import { useAuth} from '../context/AuthContext'

function RoomChat({ roomId ,roomCode }) {

  const { user } = useAuth()

  const [messages, setMessages] = useState([])

  const [message, setMessage] = useState('')
  const [typingUser, setTypingUser] = useState('')
  const typingTimeout = useRef(null)
  const chatRef = useRef(null)

  useEffect(() => {

    if (!roomId)
      return

    fetchMessages()

  }, [roomId])

  useEffect(() => {

  socket.on(
    'receive-room-message',
    (data) => {

      setMessages(
        prev => [
          ...prev,
          data.messageData
        ]
      )
    }
  )

  return () => {

    socket.off(
      'receive-room-message'
    )
  }

}, []);

  const fetchMessages =
    async () => {

      try {

        const response =
          await api.get(
            `/rooms/messages/${roomId}`
          )

        setMessages(
          response.data
        )

      } catch (error) {

        console.log(error)
      }
    }

  const sendMessage =
  async () => {

    if (!message.trim())
      return

    try {

      const response =
        await api.post(
          '/rooms/message',
          {
            room_id: roomId,
            user_id: user.id,
            message
          }
        )

      const savedMessage = response.data[0]


      socket.emit(
        'send-room-message',
        {
          roomCode,
          messageData:
            savedMessage
        }
      )

      setMessage('')

    } catch (error) {

      console.log(error)
    }
  }

  useEffect(() => {

  socket.on(
    'user-typing',
    (data) => {

      setTypingUser(
        data.username
      )

      setTimeout(() => {

        setTypingUser('')

      }, 1500)
    }
  )

  return () => {

    socket.off(
      'user-typing'
    )
  }

}, [])

useEffect(() => {

  if (chatRef.current) {

    chatRef.current.scrollTop =
      chatRef.current.scrollHeight
  }

}, [messages])

  return (

    <div className="mt-5">

      <h2 className="text-xl mb-3">
        Room Chat
      </h2>

      <div ref={chatRef}
        className="
          border
          p-3
          h-64
          overflow-y-auto
          mb-3
        "
      >

        {
          messages.map(msg => (

            <div
              key={msg.id}
              className="mb-3"
            >

              <strong>

                {
                  msg.users?.username
                  ||
                  msg.users?.email
                }

              </strong>

              <p>
                {msg.message}
              </p>

            </div>
          ))
        }

      </div>
      {
  typingUser && (

    <p className="text-sm text-gray-500 mb-2">

      {typingUser}
      {' '}
      is typing...

    </p>
  )
}

<input
  value={message}
  onChange={(e) => {

    setMessage(
      e.target.value
    )

    clearTimeout(
      typingTimeout.current
    )

    typingTimeout.current =
      setTimeout(() => {

        socket.emit(
          'typing',
          {
            roomCode,
            username:
              user.email
          }
        )

      }, 300)
  }}

  onKeyDown={(e) => {

    if (e.key === 'Enter') {

      sendMessage()
    }
  }}

  placeholder="Type a message..."
/>

      <button
        onClick={sendMessage}
        className="
          bg-blue-500
          text-white
          p-2
        "
      >
        Send
      </button>

    </div>
  )
}

export default RoomChat