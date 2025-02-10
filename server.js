const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const dbManager = require("./config/database");
const { Server } = require("socket.io");
const { createServer } = require("http");
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });
const mainRoutes = require("./routes/main");
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/events");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const profileRoutes = require("./routes/profile");

// Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

// Connect To Database
dbManager.connectDB();

// Socket.io
app.set("io", io);

// EJS for views
app.set("view engine", "ejs");

// Static Folder
app.use(express.static("public"));

// Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(logger("dev"));

// Forms for put, patch, delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_STRING,
      collectionName: "sessions",
    }),
  })
);

// Socket.IO connection chatIds
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join chat", (chatId) => {
    // Join a specific room based on the chatId
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on("chat message", (msg, chatId) => {
    // Emit the message and chatId
    io.emit("chat message", msg, chatId);
    console.log(`Message sent to chat room: ${chatId}`);
  });

  socket.on("group name", (name, chatId) => {
    // Emit the group name and chatId
    io.emit("group name", name, chatId);
    console.log(`Group name updated for chat room: ${chatId}`);
  });

  socket.on("new member", (member) => {
    // Emit the new member
    io.emit("new member", member);
    console.log(`New member`);
  });

  socket.on("new event", (event, chatId) => {
    // Emit the new event
    io.emit("new event", event, chatId);
    console.log(`New event for chat room: ${chatId}`);
  });

  socket.on("delete chat", (chat) => {
    // Emit the deleted chat room
    socket.broadcast.emit("delete chat", chat);
    console.log(`Chat deleted`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages for errors, info, ect.
app.use(flash());

// Routes for which the server is listening
app.use("/", mainRoutes);
app.use("/about", mainRoutes);
app.use("/learn", mainRoutes);
app.use("/safety", mainRoutes);
app.use("/user", userRoutes);
app.use("/events", eventRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/profile", profileRoutes);

// Server running
server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}, you better catch it!`);
});

module.exports = io;