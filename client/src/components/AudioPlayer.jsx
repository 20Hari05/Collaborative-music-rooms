import { useEffect, useRef ,useState } from 'react'
import socket from '../sockets/socket'
import api from '../api/axios'

 function AudioPlayer({
  song,
  roomCode,
  roomId,
  isHost
})
{


  const audioRef = useRef(null)
  const syncingRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  
  const [currentTime, setCurrentTime] =
  useState(0)

const [duration, setDuration] =
  useState(0)


useEffect(() => {
    console.log('Listener Registered')
  socket.on(
    'receive-playback-update',
    async (data) => {


      if (!audioRef.current)
        return

      if (data.action === 'play') {

        syncingRef.current = 'play'

        audioRef.current.currentTime =
          data.currentTime

        if (
  !isHost &&
  !isListening
)
  return

try {

  await audioRef.current.play()

} catch (error) {

  console.log(error)
}
      }

      if (data.action === 'pause') {

  if (
    !isHost &&
    !isListening
  )
    return

  syncingRef.current = 'pause'

  audioRef.current.pause()
}

    if (data.action === 'seek') {

  if (
    !isHost &&
    !isListening
  )
    return

  syncingRef.current = 'seek'

  audioRef.current.currentTime =
    data.currentTime
}
    }
  )

  return () => {


    socket.off(
      'receive-playback-update'
    )
  }

}, [isHost, isListening])


useEffect(() => {

  const audio =
    audioRef.current

  if (!audio)
    return

  const updateTime = () => {

    setCurrentTime(
      audio.currentTime
    )

    setDuration(
      audio.duration || 0
    )
  }

  audio.addEventListener(
    'timeupdate',
    updateTime
  )

  return () => {

    audio.removeEventListener(
      'timeupdate',
      updateTime
    )
  }

}, [song])


useEffect(() => {

  if (song) {

    syncPlayback()
  }

}, [song])


useEffect(() => {

  if (!song || !roomId)
    return

  const interval =
    setInterval(
      async () => {

        if (!isHost)
          return

        if (!audioRef.current)
          return

        try {

          console.log(
            'SAVE STATE:',
            {
              currentTime:
                audioRef.current.currentTime,
              paused:
                audioRef.current.paused
            }
          )

          const response =
            await api.post(
              '/rooms/playback/update',
              {
                room_id: roomId,
                current_song_id:
                  song.id,
                position_seconds:
                  audioRef.current.currentTime,
                is_playing:
                  !audioRef.current.paused
              }
            )


        } catch (error) {

          console.log(
            'PLAYBACK SAVE ERROR:',
            error.response?.data ||
            error
          )
        }

      },
      3000
    )

  return () =>
    clearInterval(interval)

}, [
  song,
  roomId,
  isHost
])

useEffect(() => {

  socket.on(
    'connect',
    () => {

      console.log(
        'Socket reconnected'
      )

      syncPlayback()
    }
  )

  return () => {

    socket.off(
      'connect'
    )
  }

}, [])



const handlePlay = () => {

  if (syncingRef.current === 'play') {

    syncingRef.current = null

    return
  }
 
  if (!roomCode) return
  if (!isHost)
  return

  socket.emit(
    'playback-update',
    {
      roomCode,
      action: 'play',
      currentTime:
        audioRef.current.currentTime
    }
  )
}
const handlePause = () => {

  if (syncingRef.current === 'pause') {

    syncingRef.current = null

    return
  }

  if (!roomCode) return
   if (!isHost)
  return

  socket.emit(
    'playback-update',
    {
      roomCode,
      action: 'pause',
      currentTime:
        audioRef.current.currentTime
    }
  )
}
const handleSeek = () => {

  if (syncingRef.current === 'seek') {

    syncingRef.current = null

    return
  }

  if (!roomCode) return
   if (!isHost)
  return

  socket.emit(
    'playback-update',
    {
      roomCode,
      action: 'seek',
      currentTime:
        audioRef.current.currentTime
    }
  )
}
const handleSongEnd =
  () => {

    if (!isHost)
      return

    socket.emit(
      'next-song',
      roomCode
    )
  }
 const toggleListening =
  async () => {

    try {

      if (isListening) {

        audioRef.current.pause()

        setIsListening(false)

        return
      }

      const response =
        await api.get(
          `/rooms/playback/${roomId}`
        )

      const playback =
        response.data

      if (
        playback &&
        audioRef.current
      ) {

        audioRef.current.currentTime =
          playback.position_seconds || 0
      }

      await audioRef.current.play()

      setIsListening(true)

    } catch (error) {

      console.log(error)
    }
  }
  const syncPlayback =
  async () => {

    try {

      if (!roomId)
        return

      const response =
        await api.get(
          `/rooms/playback/${roomId}`
        )
const playback =
  response.data

      if (!audioRef.current)
        return
      if (!playback) {
         console.log('No playback found')
         return
        }
      audioRef.current.currentTime =
        playback.position_seconds || 0

    if (isHost) {

  if (playback.is_playing) {

    try {

      await audioRef.current.play()

    } catch (error) {

      console.log(error)
    }

  } else {

    audioRef.current.pause()
  }
}

    } catch (error) {

      console.log(error)
    }
  }

  if (!song) {
    return <div>No song selected</div>
  }
  

const formatTime = seconds => {

  const mins =
    Math.floor(seconds / 60)

  const secs =
    Math.floor(seconds % 60)

  return `${mins}:${
    secs
      .toString()
      .padStart(2, '0')
  }`
}


  return (
    <div className="mt-5">

      <h2 className="text-xl">
        {song.title}
      </h2>

      <p>{song.artist}</p>
     {
  !isHost && (

    <button
      onClick={toggleListening}
      className="
        bg-green-500
        text-white
        px-4
        py-2
        mb-3
        block
      "
    >
      {
        isListening
          ? 'Stop Listening'
          : 'Start Listening'
      }
    </button>

  )
}
{
  !isHost &&
  isListening && (

    <div className="mt-3">

      <p>
        {formatTime(currentTime)}
        {' / '}
        {formatTime(duration)}
      </p>

      <progress
        value={currentTime}
        max={duration || 1}
        className="w-full"
      />

    </div>

  )
}
      <audio
  ref={audioRef}
  controls = {isHost}
  src={song.audio_url}
  onPlay={handlePlay}
  onPause={handlePause}
  onSeeked={handleSeek}
  onEnded={handleSongEnd}
/>

    </div>
  )
}

export default AudioPlayer