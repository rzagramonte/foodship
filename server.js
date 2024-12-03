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
const userRoutes = require("./routes/user")
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

  socket.on("connection", (chatId) => {
    socket.join(chatId);
    console.log(`User joined group: ${chatId}`);
  });

  socket.on("chat message", ({ chatId, content, contentType, imgUrl }) => {
    const message = {
      senderId: socket.id,
      content: contentType == "text" ? content : null,
      image: contentType == "image" ? imgUrl?.secure_url : null,
      cloudinaryId: imgUrl?.public_id,
      contentType,
    };
    io.to(chatId).emit("chat message", message);
  });

  // Handle socket events here
  socket.on("disconnection", () => {
    console.log("user disconnected from group");
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
