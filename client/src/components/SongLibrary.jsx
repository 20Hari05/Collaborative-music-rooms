import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function SongLibrary({ roomId,onSelectSong }) {

  const [songs, setSongs] = useState([])
  const { user } = useAuth()

  useEffect(() => {

    fetchSongs()

  }, [])

  const fetchSongs = async () => {

    try {

      const response =
        await api.get('/rooms/songs')

      setSongs(response.data)

    } catch (error) {

      console.log(error)
    }
  }

const addToQueue = async (song) => {

  try {

    await api.post(
      '/rooms/queue/add',
      {
        room_id: roomId,
        song_id: song.id,
        added_by: user.id
      }
    )

    const queue =
      await api.get(
        `/rooms/queue/${roomId}`
      )

    if (
      queue.data.length === 1
    ) {

      onSelectSong(song)
    }

  } catch (error) {

    console.log(error)
  }
}

  return (

    <div className="mt-5">

      <h1 className="text-2xl mb-4">
        Song Library
      </h1>

      {
        songs.map((song) => (

         <div
  key={song.id}
  className="
    border
    p-3
    mb-2
    flex
    justify-between
    items-center
  "
>

  <div>

    <p className="font-bold">
      {song.title}
    </p>

    <p>
      {song.artist}
    </p>

  </div>

  <button
    onClick={() => addToQueue(song)}
    className="
      bg-green-500
      text-white
      px-4
      py-2
    "
  >
    Add To Queue
  </button>

</div>
        ))
      }

    </div>
  )
}

export default SongLibrary