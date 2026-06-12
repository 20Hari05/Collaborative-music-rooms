const supabase = require('../config/supabase')

const authMiddleware = async (req, res, next) => {

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      message: 'No token provided'
    })
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }

  req.user = user

  next()
}

module.exports = authMiddleware