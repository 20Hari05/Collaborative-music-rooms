const supabase = require('../config/supabase')

const sendFriendRequest = async (req, res) => {

  try {

    const { sender_id, receiver_id } = req.body

    console.log('Request Body:', req.body)

    const { data, error } = await supabase
      .from('friends')
      .insert([
        {
          sender_id,
          receiver_id,
          status: 'pending'
        }
      ])
      .select()

    console.log('Inserted Data:', data)

    if (error) {

      console.log('Supabase Error:', error)

      return res.status(500).json(error)
    }

    res.json({
      message: 'Friend request sent'
    })

  } catch (err) {

    console.log('Catch Error:', err)

    res.status(500).json({
      error: err.message
    })
  }
}

module.exports = {
  sendFriendRequest
}