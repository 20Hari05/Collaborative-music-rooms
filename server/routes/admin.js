const express = require('express')
const router = express.Router()

const supabase =
  require('../config/supabase')

/*
=================================
CREATE SONG
POST /admin/song
=================================
*/

router.post(
  '/song',
  async (req, res) => {

    try {

      const {
        title,
        artist,
        audio_url,
        cover_url
      } = req.body

      const {
        data,
        error
      } = await supabase
        .from('songs')
        .insert([
          {
            title,
            artist,
            audio_url,
            cover_url
          }
        ])
        .select()

      if (error) {

        return res
          .status(500)
          .json(error)
      }

      res.json(data)

    } catch (error) {

      console.log(error)

      res.status(500).json({
        message:
          'Failed to create song'
      })
    }
  }
)

/*
=================================
GET ALL SONGS
GET /admin/songs
=================================
*/

router.get(
  '/songs',
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from('songs')
        .select('*')
        .order(
          'id',
          {
            ascending: false
          }
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
        message:
          'Failed to fetch songs'
      })
    }
  }
)

/*
=================================
UPDATE SONG
PUT /admin/song/:id
=================================
*/

router.put(
  '/song/:id',
  async (req, res) => {

    try {

      const { id } =
        req.params

      const {
        title,
        artist
      } = req.body

      const {
        data,
        error
      } = await supabase
        .from('songs')
        .update({
          title,
          artist
        })
        .eq(
          'id',
          id
        )
        .select()

      if (error) {

        return res
          .status(500)
          .json(error)
      }

      res.json(data)

    } catch (error) {

      console.log(error)

      res.status(500).json({
        message:
          'Failed to update song'
      })
    }
  }
)

/*
=================================
DELETE SONG
DELETE /admin/song/:id
=================================
*/

router.delete(
  '/song/:id',
  async (req, res) => {

    try {

      const { id } =
        req.params

      const { error } =
        await supabase
          .from('songs')
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

    } catch (error) {

      console.log(error)

      res.status(500).json({
        message:
          'Failed to delete song'
      })
    }
  }
)

module.exports = router