const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const supabase = require("./config/supabase");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const usersRoutes = require("./routes/users");
const friendsRoutes = require("./routes/friends");
const roomsRoutes = require("./routes/rooms");
const adminRoutes = require("./routes/admin");
const onlineUsers = {}
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://collaborative-music-rooms.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://collaborative-music-rooms.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/friends", friendsRoutes);
app.use("/rooms", roomsRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Collaborative Music Room Backend Running");
});

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // REGISTER USER
  socket.on(
  "register-user",
  (userId) => {

    socket.userId =
      userId

    onlineUsers[userId] =
      socket.id
  }
)

  // PRIVATE MESSAGE
  socket.on("private-message", async (data) => {

    await supabase
      .from("messages")
      .insert([
        {
          sender_id: data.senderId,
          receiver_id: data.receiverId,
          message: data.message,
        },
      ]);

    const receiverSocketId =
      onlineUsers[data.receiverId];

    if (receiverSocketId) {

      io.to(receiverSocketId).emit(
        "receive-message",
        data
      );
    }
  });

  // JOIN ROOM
  socket.on(
  "join-room",
  async (data) => {

    const {
      roomCode,
      roomId,
      userId
    } = data

    socket.join(roomCode)

    socket.roomId =
      roomId

    socket.userId =
      userId

    const result =
  await supabase
    .from("room_presence")
    .upsert(
      [
        {
          room_id: roomId,
          user_id: userId,
          is_online: true,
          updated_at: new Date()
        }
      ],
      {
        onConflict:
          "room_id,user_id"
      }
    )
    .select()

console.log(
  "Presence Upsert:",
  result
)
  }
)

  // PLAYBACK UPDATE
  socket.on("playback-update", (data) => {

  console.log(
    "PLAYBACK EVENT:",
    data.action,
    data.roomCode,
    socket.id
  )

  socket.to(data.roomCode).emit(
    "receive-playback-update",
    data
  )
});
// SONG CHANGE
socket.on(
  "song-change",
  (data) => {

    socket
      .to(data.roomCode)
      .emit(
        "receive-song-change",
        data
      );
  }
);
  // QUEUE UPDATE
  socket.on("queue-update", (data) => {

    socket.to(data.roomCode).emit(
      "receive-queue-update",
      data
    );
  });
  //NEXT SONG
  socket.on(
  'next-song',
  (roomCode) => {

    io.to(roomCode)
      .emit(
        'play-next-song'
      )
  }
);


// ROOM CHAT
socket.on(
  'send-room-message',
  (data) => {

    socket.to(
      data.roomCode
    ).emit(
      'receive-room-message',
      data
    )
  }
)
//TYPING INDICATOR
socket.on(
  'typing',
  (data) => {

    socket
      .to(data.roomCode)
      .emit(
        'user-typing',
        data
      )
  }
)
//NOTIFICATIONS
socket.on(
  'send-notification',
  (data) => {

    const receiverSocketId =
      onlineUsers[
        data.receiverId
      ]

    if (
      receiverSocketId
    ) {

      io.to(
        receiverSocketId
      ).emit(
        'receive-notification',
        data
      )
    }
  }
)
  // DISCONNECT
socket.on(
  "disconnect",
  async () => {

    try {

      if (
        socket.roomId &&
        socket.userId
      ) {

        await supabase
          .from(
            "room_presence"
          )
          .update({
            is_online: false,
            updated_at:
              new Date()
          })
          .eq(
            "room_id",
            socket.roomId
          )
          .eq(
            "user_id",
            socket.userId
          )

        socket.broadcast.emit(
          "user-left",
          {
            userId:
              socket.userId
          }
        )
      }

      // remove from onlineUsers map
      for (
        const userId
        in onlineUsers
      ) {

        if (
          onlineUsers[userId]
          === socket.id
        ) {

          delete
            onlineUsers[
              userId
            ]
        }
      }

      console.log(
        "User disconnected:",
        socket.id
      )

    } catch (error) {

      console.log(
        "Disconnect Error:",
        error
      )
    }});
});

console.log("Supabase Connected Successfully");

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});