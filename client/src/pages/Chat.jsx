import { useEffect } from 'react'
import socket from '../sockets/socket'

useEffect(() => {

  socket.on('receive-message', (data) => {
    console.log('Message:', data)
  })

  return () => {
    socket.off('receive-message')
  }

}, [])