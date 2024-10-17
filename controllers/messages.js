const cloudinary = require("../middleware/cloudinary");
const Message = require("../models/Message");

module.exports = {
  getMessages: async (req, res) => {
    const { chatId } = req.params;
    try {
      const messages = await Message.find({ chatId })
        .sort({ createdAt: "asc" })
        .lean();
      res.render("chat.ejs", { user: req.user, messages: messages });
    } catch (err) {
      console.log(err);
    }
  },
  postMessage: async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      const { chatId, senderId, content, contentType } = req.body;
      const newMessage = await Message.create({
        content: contentType === "text" ? content : undefined,
        image: contentType === "image" ? result.secure_url : undefined,
        cloudinaryId: result.public_id,
        likes: 0,
        sender: senderId,
        chat: chatId,
      });
      console.log("Message has been saved!");
      res.status(201).json(newMessage);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Error sending message' });
    }
  },
  //add or remove like from message
  patchMessage: async (req, res) => {
    try {
      const messageID = req.body.messageIDFromEJSFile;
      const userID = req.user.id;
      const message = await Message.findOne({ _id: message, likedBy: userID });
      if (message) {
        await Message.findOneAndUpdate(
          { _id: messageID, likedBy: userID },
          { $pull: { likedBy: userID }, $inc: { likes: -1 } }
        );
        console.log("User has already liked the message");
        res.status(400).json({ error: "User has already liked the message" });
        return;
      }
      await Message.findOneAndUpdate(
        { _id: messageID },
        { $push: { likedBy: userID }, $inc: { likes: 1 } },
        { upsert: true }
      );
      console.log("Marked Like");
      res.json("Marked Like");
    } catch (err) {
      console.log(err);
    }
  },
  deleteMessage: async (req, res) => {
    try {
      let message = await Message.findById({ _id: req.params.id });
      await cloudinary.uploader.destroy(message.cloudinaryId);
      await Message.remove({ _id: req.params.id });
      console.log("Deleted Message");
      res.redirect("/groupChat");
    } catch (err) {
      res.redirect("/groupChat");
    }
  },
};
