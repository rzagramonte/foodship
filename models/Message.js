const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
  },
  image: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  contentType: {
    type: String,
    enum: ["text", "image"],
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to enforce content or image requirement based on contentType
MessageSchema.pre("save", async function (next) {
  try {
    const user = await this.populate({
      path: "senderId",
      select: "userName", // Specify `userName` to reduce data load
    });
    this.userName = user?.userName;

    // Validate content based on contentType
    if (this.contentType === "text" && !this.content)
      return next(new Error("Text messages must have content"));
    if (this.contentType === "image" && !this.image)
      return next(new Error("Image messages must have an image"));
  } catch (error) {
    console.log("Message error: ", error);
  }
});

module.exports = mongoose.model("Message", MessageSchema);
