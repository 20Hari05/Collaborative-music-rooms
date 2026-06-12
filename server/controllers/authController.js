const supabase = require("../config/supabase");

const signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Insert into users table
    await supabase
      .from("users")
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          username: username,
        },
      ]);

    res.status(201).json({
      message: "User created successfully",
      user: data.user,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = {
  signup,
};