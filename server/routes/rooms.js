const express = require('express')
const router = express.Router()

const supabase = require('../config/supabase')


// CREATE ROOM API
router.post('/create', async (req, res) => {

  const {
    room_name,
    host_id
  } = req.body

  const room_code =
    Math.random()
      .toString(36)
      .substring(2, 8)

  const { data, error } = await supabase
    .from('rooms')
    .insert([
      {
        room_name,
        room_code,
        host_id
      }
    ])
    .select()

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
})


// JOIN ROOM API
router.post('/join', async (req, res) => {

  const {
    room_code,
    user_id
  } = req.body

  const {
    data: room,
    error: roomError
  } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', room_code)
    .single()

  if (roomError || !room) {

    return res.status(404).json({
      message: 'Room not found'
    })
  }

  const {
    data,
    error
  } = await supabase
    .from('room_members')
    .insert([
      {
        room_id: room.id,
        user_id
      }
    ])

  if (error) {
    return res.status(500).json(error)
  }

  res.json(room)
})
router.get(
  "/presence/:roomId",
  async (req, res) => {

    const { roomId } =
      req.params

    try {

      const {
        data,
        error
      } = await supabase
        .from(
          "room_presence"
        )
        .select(`
          *,
          users (
            username,
            email
          )
        `)
        .eq(
          "room_id",
          roomId
        )
        .eq(
          "is_online",
          true
        )

      if (error) {

        return res
          .status(500)
          .json(error)
      }

      res.json(data)

    } catch (error) {

      console.log(error)

      res.status(500).json({
        error:
          "Failed to fetch presence"
      })
    }
  }
)


router.post('/queue/add', async (req, res) => {

  const {
    room_id,
    song_id,
    added_by
  } = req.body

  const { data, error } = await supabase
    .from('room_queue')
    .insert([
      {
        room_id,
        song_id,
        added_by
      }
    ])
    .select()

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
})

router.post(
  '/playback/update',
  async (req, res) => {

    const {
      room_id,
      current_song_id,
      position_seconds,
      is_playing
    } = req.body

    console.log(req.body)

    const { data, error } =
      await supabase
        .from('room_playback')
        .upsert([
          {
            room_id,
            current_song_id,
            position_seconds,
            is_playing
          }
        ])

    console.log('UPSERT ERROR:', error)

    if (error) {
      return res
        .status(500)
        .json(error)
    }

    res.json(data)
  }
)

router.get('/songs', async (req, res) => {

  const { data, error } = await supabase
    .from('songs')
    .select('*')

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
})

router.get(
  '/playback/:roomId',
  async (req, res) => {

    const { roomId } = req.params

    const { data, error } =
      await supabase
        .from('room_playback')
        .select(`
          *,
          songs(*)
        `)
        .eq('room_id', roomId)
        .maybeSingle()

    if (error) {

      console.log(
        'PLAYBACK ERROR:',
        error
      )

      return res
        .status(500)
        .json(error)
    }

    res.json(data || null)
  }
)

router.get(
  '/queue/:roomId',
  async (req, res) => {

    const { roomId } =
      req.params

    const { data, error } =
      await supabase
        .from('room_queue')
        .select(`
          *,
          songs(*)
        `)
        .eq(
          'room_id',
          roomId
        )

    if (error) {
      return res
        .status(500)
        .json(error)
    }

    res.json(data)
  }
)
router.get(
  '/members/:roomId',
  async (req, res) => {

    const { roomId } =
      req.params

    const {
      data,
      error
    } = await supabase
      .from('room_members')
      .select(`
        *,
        users(*)
      `)
      .eq(
        'room_id',
        roomId
      )

    if (error) {
      return res
        .status(500)
        .json(error)
    }

    res.json(data)
  }
)

router.post(
  '/message',
  async (req, res) => {

    const {
      room_id,
      user_id,
      message
    } = req.body

    const { data, error } =
      await supabase
        .from('room_messages')
        .insert([
          {
            room_id,
            user_id,
            message
          }
        ])
       .select(` *, users(username,email)`)

    if (error)
      return res.status(500).json(error)

    res.json(data)
  }
)

router.get(
  '/messages/:roomId',
  async (req, res) => {

    const { roomId } = req.params

    const { data, error } =
      await supabase
        .from('room_messages')
        .select(`
          *,
          users(username,email)
        `)
        .eq('room_id', roomId)
        .order(
          'created_at',
          { ascending: true }
        )

    if (error)
      return res.status(500).json(error)

    res.json(data)
  }
)

router.get(
  '/notifications/:userId',
  async (req, res) => {

    const { userId } =
      req.params

    const {
      data,
      error
    } = await supabase
      .from('notifications')
      .select('*')
      .eq(
        'user_id',
        userId
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      )

    if (error)
      return res
        .status(500)
        .json(error)

    res.json(data)
  }
)

router.post(
  '/invite',
  async (req, res) => {

    const {
      room_id,
      sender_id,
      receiver_email
    } = req.body

    const {
      data: receiver
    } = await supabase
      .from('users')
      .select('*')
      .eq(
        'email',
        receiver_email
      )
      .single()

    if (!receiver) {

      return res.status(404)
        .json({
          message:
            'User not found'
        })
    }

    const {
      data,
      error
    } = await supabase
      .from('room_invites')
      .insert([
        {
          room_id,
          sender_id,
          receiver_id:
            receiver.id
        }
      ])
      .select()

    if (error)
      return res
        .status(500)
        .json(error)

    await supabase
      .from('notifications')
      .insert([
        {
          user_id:
            receiver.id,

          title:
            'Room Invitation',

          message:
            'You have been invited to a room'
        }
      ])
       
      

    res.json({
  invite: data[0],
  receiverId:
    receiver.id
})
  }
)

router.get(
  '/invites/:userId',
  async (req, res) => {

    const { userId } =
      req.params

    const {
      data,
      error
    } = await supabase
      .from('room_invites')
      .select(`
        *,
        rooms(*),
        users!room_invites_sender_id_fkey(
          email,
          username
        )
      `)
      .eq(
        'receiver_id',
        userId
      )
      .eq(
        'status',
        'pending'
      )

    if (error)
      return res
        .status(500)
        .json(error)

    res.json(data)
  }
)

router.post(
  '/invite/accept',
  async (req, res) => {

    const {
      inviteId
    } = req.body

    const {
      data: invite
    } = await supabase
      .from('room_invites')
      .select('*')
      .eq(
        'id',
        inviteId
      )
      .single()

    await supabase
      .from('room_members')
      .insert([
        {
          room_id:
            invite.room_id,

          user_id:
            invite.receiver_id
        }
      ])

    await supabase
      .from('room_invites')
      .update({
        status:
          'accepted'
      })
      .eq(
        'id',
        inviteId
      )

    res.json({
      success: true
    })
  }
)

router.post(
  '/invite/reject',
  async (req, res) => {

    const {
      inviteId
    } = req.body

    await supabase
      .from('room_invites')
      .update({
        status:
          'rejected'
      })
      .eq(
        'id',
        inviteId
      )

    res.json({
      success: true
    })
  }
)


router.get(
  '/:roomCode',
  async (req, res) => {

    const { roomCode } =
      req.params

    const {
      data,
      error
    } = await supabase
      .from('rooms')
      .select('*')
      .eq(
        'room_code',
        roomCode
      )
      .single()

    if (error) {

      return res
        .status(404)
        .json({
          message:
            'Room not found'
        })
    }

    res.json(data)
  }
)

router.delete(
  '/queue/:id',
  async (req, res) => {

    const { id } =
      req.params

    const { error } =
      await supabase
        .from('room_queue')
        .delete()
        .eq('id', id)

    if (error) {
      return res
        .status(500)
        .json(error)
    }

    res.json({
      success: true
    })
  }
)


module.exports = router