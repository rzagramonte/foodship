const cloudinary = require("../middleware/cloudinary");
const Message = require("../models/Message");

module.exports = {
  getMessages: async (req, res) => {
    const { chatId } = req.params;
    try {
      const messages = await Message.find({ chatId })
        .sort({ createdAt: "asc" })
        .lean();
      res.render("profile.ejs", { user: req.user, messages: messages });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error getting all messages" });
    }
  },
  postMessage: async (req, res) => {
    try {
      let imgUrl;
      if (req.file) imgUrl = await cloudinary.uploader.upload(req.file.path);
      const { chatId, senderId, content, contentType } = req.body;
      const newMessage = await Message.create({
        chatId,
        senderId,
        content: contentType == "text" ? content : null,
        image: contentType == "image" ? imgUrl?.secure_url : null,
        cloudinaryId: imgUrl?.public_id,
        contentType,
      });
      console.log("Message has been saved!");
      res.status(201).json(newMessage);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error sending message" });
    }
  },
  //add or remove like from message
  patchMessage: async (req, res) => {
    try {
      const messageId = req.body.messageIdFromEJSFile;
      const userId = req.user.id;
      const message = await Message.findOne({ _id: messageId, likedBy: userId });
      if (message) {
        await Message.findOneAndUpdate(
          { _id: messageId, likedBy: userId },
          { $pull: { likedBy: userId }, $inc: { likes: -1 } }
        );
        console.log("User has unliked the message");
        res.status(200).json("User has unliked the message");
        return;
      }
      await Message.findOneAndUpdate(
        { _id: messageId },
        { $push: { likedBy: userId }, $inc: { likes: 1 } },
        { upsert: true }
      );
      console.log("Marked Like");
      res.status(200).json("Marked Like");
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error processing like" });
    }
  },
  deleteMessage: async (req, res) => {
    try {
      let message = await Message.findById({ _id: req.params.id });
      await cloudinary.uploader.destroy(message.cloudinaryId);
      await Message.deleteOne({ _id: req.params.id });
      console.log("Message has been deleted!");
      res.status(204).send();
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error deleting message" });
    }
  },
};