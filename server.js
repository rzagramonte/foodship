const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const { Server } = require("socket.io");
const { createServer } = require("http");
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });
const mainRoutes = require("./routes/main");
const userRoutes = require("./routes/user");
const connectionRoutes = require("./routes/connections");
const eventRoutes = require("./routes/events");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

app.set("io", io);

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put, patch, delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_STRING, // Use your MongoDB connection string directly here
      collectionName: "sessions",
    }),
  })
);

// Set up Socket.IO connection chatIds
io.on("connection", (socket) => {
  console.log("User connected");

  // Join a specific room based on the chatId
  socket.on("join chat", (chatId) => {
    socket.join(chatId); // Joining the room using the chatId
    console.log(`User joined chat room: ${chatId}`);
  });

  // Listen for the message and broadcast to the specific chat room
  socket.on("chat message", (msg, chatId) => {
    // Emit the message to the specific room (chatId)
    io.emit("chat message", msg, chatId);
    console.log(`Message sent to chat room: ${chatId}`);
  });

  socket.on("group name", (name, chatId) => {
    // Emit the message to the specific room (chatId)
    io.emit("group name", name, chatId);
    console.log(`Group name updated for chat room: ${chatId}`);
  });

  socket.on("new member", (member) => {
    // Emit the message to the specific room (chatId)
    io.emit("new member", member); // Broadcast join message
    console.log(`New member`);
  });

  socket.on("delete chat", (chat, chatId) => {
    // Emit the message to the specific room (chatId)
    io.emit("delete chat", chat, chatId); // Broadcast join message
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

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/about", mainRoutes);
app.use("/learn", mainRoutes);
app.use("/safety", mainRoutes);
app.use("/user", userRoutes);
app.use("/connections", connectionRoutes);
app.use("/events", eventRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messageRoutes);

//Server Running
server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}, you better catch it!`);
});
