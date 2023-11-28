const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("api runing");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//-------------deploy------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(5000, console.log(`server run on port ${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN,
  },
});

io.on("connection", (socket) => {
  console.log("connnetcd to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecived) => {
    var chat = newMessageRecived.chat;
    if (!chat.users) return console.log("chat.user not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecived.sender._id) return;

      socket.in(user._id).emit("message recived", newMessageRecived);
    });
  });

  socket.off("setup", () => {
    console.log("user disconnected");
    socket.leave(userData._id);
  });
});
