import { useEffect, useState} from 'react'
import api from '../api/axios'
import supabase from '../services/supabase'
import { useAuth } from '../context/AuthContext'

function Admin() {

    const { user } = useAuth()

    const [
  title,
  setTitle
] = useState('')

const [
  artist,
  setArtist
] = useState('')

const [
  audioFile,
  setAudioFile
] = useState(null)

const [
  coverFile,
  setCoverFile
] = useState(null)

const [
  editingSong,
  setEditingSong
] = useState(null)

const [
  editTitle,
  setEditTitle
] = useState('')

const [
  editArtist,
  setEditArtist
] = useState('')

const [
  search,
  setSearch
] = useState('')

const [
  isAdmin,
  setIsAdmin
] = useState(false)

const [
  checkingAdmin,
  setCheckingAdmin
] = useState(true)


const fetchSongs =
  async () => {

    try {

      const response =
        await api.get(
          '/admin/songs'
        )

      setSongs(
        response.data
      )

    } catch (error) {

      console.log(error)
    }
  }

const uploadSong =
  async () => {

    try {

      if (
        !audioFile ||
        !coverFile
      )
        return

      const audioPath =
        `audio/${Date.now()}-${audioFile.name}`

      const coverPath =
        `covers/${Date.now()}-${coverFile.name}`

     const {
  data: audioUpload,
  error: audioError
} = await supabase
  .storage
  .from('music')
  .upload(
    audioPath,
    audioFile
  )

console.log(
  'AUDIO UPLOAD',
  audioUpload
)

console.log(
  'AUDIO ERROR',
  audioError
)

    const {
  data: coverUpload,
  error: coverError
} = await supabase
  .storage
  .from('music')
  .upload(
    coverPath,
    coverFile
  )

if (
  audioError ||
  coverError
) {

  alert(
    'Upload Failed'
  )

  return
}

      const {
        data: audioData
      } = supabase
        .storage
        .from('music')
        .getPublicUrl(
          audioPath
        )

      const {
        data: coverData
      } = supabase
        .storage
        .from('music')
        .getPublicUrl(
          coverPath
        )

      await api.post(
        '/admin/song',
        {
          title,
          artist,
          audio_url:
            audioData.publicUrl,
          cover_url:
            coverData.publicUrl
        }
      )
      fetchSongs();

      alert(
        'Song Uploaded'
      )

    } catch (error) {

      console.log(error)
    }
  }

  const updateSong =
  async () => {

    try {

      await api.put(
        `/admin/song/${editingSong.id}`,
        {
          title:
            editTitle,
          artist:
            editArtist
        }
      )

      setEditingSong(null)

      fetchSongs()

    } catch (error) {

      console.log(error)
    }
  }

  const deleteSong =
  async (songId) => {

    try {

      await api.delete(
        `/admin/song/${songId}`
      )

      fetchSongs()

    } catch (error) {

      console.log(error)
    }
  }

  const [
  songs,
  setSongs
] = useState([])

useEffect(() => {

  const checkAdmin =
    async () => {

      if (!user) {

        setCheckingAdmin(false)
        return
      }

      const {
        data,
        error
      } = await supabase
        .from('users')
        .select('role')
        .eq(
          'id',
          user.id
        )
        .single()

      if (error) {

        console.log(error)
      }

      if (
        data?.role ===
        'admin'
      ) {

        setIsAdmin(true)
      }

      setCheckingAdmin(false)
    }

  checkAdmin()

}, [user])

useEffect(() => {

  fetchSongs()

}, [])


if (checkingAdmin) {

  return (
    <div>
      Loading...
    </div>
  )
}

if (!isAdmin) {

  return (
    <div>
      Access Denied
    </div>
  )
}

  return (

   <div
  className="
    border
    p-5
    mb-5
  "
>

  <input
    type="text"
    placeholder="Title"
    value={title}
    onChange={(e) =>
      setTitle(
        e.target.value
      )
    }
    className="
      border
      p-2
      block
      mb-2
    "
  />

  <input
    type="text"
    placeholder="Artist"
    value={artist}
    onChange={(e) =>
      setArtist(
        e.target.value
      )
    }
    className="
      border
      p-2
      block
      mb-2
    "
  />

  <input
    type="file"
    accept="audio/*"
    onChange={(e) =>
      setAudioFile(
        e.target.files[0]
      )
    }
    className="mb-2"
  />

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setCoverFile(
        e.target.files[0]
      )
    }
    className="mb-2"
  />

  <button
  onClick={uploadSong}
  className="
    bg-green-500
    text-white
    p-2
  "
>
  Upload Song
</button>



<div className="mt-10">
    <input
  type="text"
  placeholder="Search Songs"
  value={search}
  onChange={(e) =>
    setSearch(
      e.target.value
    )
  }
  className="
    border
    p-2
    mb-4
    w-full
  "
/>

  <h2 className="text-2xl mb-4">

    Song Library

  </h2>

 <div className="mt-10">

  <h2 className="text-2xl mb-4">
    Song Library
  </h2>

  {
 songs
  .filter(
    song =>
      (song.title || '')
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      (song.artist || '')
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  )
  .map(
    song => (

        <div
          key={song.id}
          className="
            border
            p-3
            mb-2
          "
        >

          <img
            src={song.cover_url}
            alt={song.title}
            className="
              w-20
              h-20
              object-cover
              mb-2
            "
          />

        <h3>
  {song.title || 'Unknown Title'}
</h3>

<p>
  {song.artist || 'Unknown Artist'}
</p>

          <div className="mt-2">

            <button
              onClick={() => {

                setEditingSong(song)

                setEditTitle(
                  song.title
                )

                setEditArtist(
                  song.artist
                )
              }}
              className="
                bg-yellow-500
                text-white
                px-3
                py-1
                mr-2
              "
            >
              Edit
            </button>

            <button
              onClick={() =>
                deleteSong(song.id)
              }
              className="
                bg-red-500
                text-white
                px-3
                py-1
              "
            >
              Delete
            </button>

          </div>

        </div>
      )
    )
  }

</div>

</div>

{
  editingSong && (

    <div
      className="
        border
        p-5
        mt-5
      "
    >

      <h2>
        Edit Song
      </h2>

      <input
        value={editTitle}
        onChange={(e) =>
          setEditTitle(
            e.target.value
          )
        }
        className="
          border
          p-2
          block
          mb-2
        "
      />

      <input
        value={editArtist}
        onChange={(e) =>
          setEditArtist(
            e.target.value
          )
        }
        className="
          border
          p-2
          block
          mb-2
        "
      />

      <button
        onClick={updateSong}
        className="
          bg-blue-500
          text-white
          p-2
        "
      >
        Save
      </button>



    </div>
  )
}

</div>


  )
}

export default Admin