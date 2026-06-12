const express = require('express')
const router = express.Router()

const supabase = require('../config/supabase')

router.get('/search', async (req, res) => {

  const query = req.query.query

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', `%${query}%`)

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
})

module.exports = router