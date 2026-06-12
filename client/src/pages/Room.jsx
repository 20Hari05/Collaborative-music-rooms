import { useEffect, useState } from "react";
import api from '../api/axios';
import { useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import socket from "../sockets/socket";

import SongLibrary from "../components/SongLibrary";
import AudioPlayer from "../components/AudioPlayer";
import Queue from '../components/Queue';
import RoomChat from '../components/RoomChat';
import RoomMembers from '../components/RoomMembers';
function Room() {
  const { roomCode } = useParams();
   const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [room, setRoom] = useState(null)
 const isHost = room?.host_id === user?.id;
  const [inviteEmail,setInviteEmail] = useState('')


  const selectSong =
  async (song) => {

    setCurrentSong(song)

    await api.post(
      '/rooms/playback/update',
      {
        room_id: room.id,
        current_song_id:
          song.id,
        position_seconds: 0,
        is_playing: false
      }
    )

    socket.emit(
      'song-change',
      {
        roomCode,
        song
      }
    )
  }

const sendInvite =
  async () => {

    try {

      const response =
        await api.post(
          '/rooms/invite',
          {
            room_id:
              room.id,

            sender_id:
              user.id,

            receiver_email:
              inviteEmail
          }
        )
      if (!response.data.receiverId) return;
      socket.emit(
        'send-notification',
        {
          receiverId:response.data.receiverId,

          title:'Room Invitation',

          message:
            `${user.email}
             invited you
             to a room`
        }
      )

      alert(
        'Invite Sent'
      )

      setInviteEmail('')

    } catch (error) {

      console.log(error)

      alert(
        'Failed To Send Invite'
      )
    }
  }

   

  useEffect(() => {

  const fetchRoom =
    async () => {

      try {

        const response =
          await api.get(
            `/rooms/${roomCode}`
          )

        setRoom(
          response.data
        )

      } catch (error) {

        console.log(error)
      }
    }

  if (roomCode) {

    fetchRoom()
  }

}, [roomCode]);


  // JOIN SOCKET ROOM + UPDATE PRESENCE
useEffect(() => {

  if (
    !roomCode ||
    !room?.id ||
    !user?.id
  )
    return

  socket.emit(
    "join-room",
    {
      roomCode,
      roomId: room.id,
      userId: user.id
    }
  )

}, [
  roomCode,
  room,
  user
])

  useEffect(() => {
    socket.on("receive-song-change", (data) => {
      setCurrentSong(data.song);
    });

    return () => {
      socket.off("receive-song-change");
    };
  }, []);

  useEffect(() => {

  const loadPlayback =
    async () => {

      if (!room?.id)
        return

      try {

        const response =
          await api.get(
            `/rooms/playback/${room.id}`
          )

        if (
          response.data?.songs
        ) {

          setCurrentSong(
            response.data.songs
          )
        }

      } catch (error) {

        console.log(error)
      }
    }

  loadPlayback()

}, [room])

  useEffect(() => {
socket.on(
  'play-next-song',
  async () => {

    if (!room?.id)
      return

    try {

      const response =
        await api.get(
          `/rooms/queue/${room.id}`
        )

      const queue =
        response.data

      if (
        queue.length === 0
      )
        return

      const currentQueueItem =
        queue[0]

      await api.delete(
        `/rooms/queue/${currentQueueItem.id}`
      )

      const updatedQueue =
        await api.get(
          `/rooms/queue/${room.id}`
        )

      if (
        updatedQueue.data.length === 0
      ) {

        setCurrentSong(null)

        return
      }

      const nextSong =
        updatedQueue.data[0]
          .songs

      setCurrentSong(
        nextSong
      )
      await api.post(
  '/rooms/playback/update',
  {
    room_id: room.id,
    current_song_id:
      nextSong.id,
    position_seconds: 0,
    is_playing: false
  }
)

      socket.emit(
        'song-change',
        {
          roomCode,
          song: nextSong
        }
      )

    } catch (error) {

      console.log(error)
    }
  }
)

  return () => {

    socket.off(
      'play-next-song'
    )
  }

}, [room]);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Music Room</h1>

      <p className="mb-4">Room Code: {roomCode}</p>
      {
  currentSong && (

    <div className="mb-4">

      <h2 className="text-xl font-bold">
        Now Playing
      </h2>

      <p>
        {currentSong.title}
      </p>

      <p>
        {currentSong.artist}
      </p>

    </div>
  )
}
  {
  currentSong && (

    <AudioPlayer
      song={currentSong}
      roomCode={roomCode}
      roomId={room?.id}
      isHost={isHost}
    />

  )
}
      
      {
  isHost && (

    <div
      className="
        border
        p-4
        mb-4
      "
    >

      <h2
        className="
          text-xl
          mb-2
        "
      >
        Invite User
      </h2>

      <input
        type="email"
        value={inviteEmail}
        onChange={(e) =>
          setInviteEmail(
            e.target.value
          )
        }
        placeholder="Enter Email"
        className="
          border
          p-2
          mr-2
        "
      />

      <button
        onClick={sendInvite}
        className="
          bg-blue-500
          text-white
          p-2
        "
      >
        Send Invite
      </button>

    </div>

  )
}

      <SongLibrary roomId = {room?.id} onSelectSong={selectSong} />
      <Queue roomId={room?.id}/>
      <RoomMembers roomId={room?.id} />
      <RoomChat roomId={room?.id}  roomCode={roomCode}/>
    </div>
  );
}

export default Room;
