const express = require('express')
const router = express.Router()

const supabase = require('../config/supabase')

router.post('/request', async (req, res) => {

  const {
    sender_id,
    receiver_id
  } = req.body

  const { data, error } = await supabase
    .from('friend_requests')
    .insert([
      {
        sender_id,
        receiver_id
      }
    ])

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
})

module.exports = router