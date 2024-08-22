const cloudinary = require("../middleware/cloudinary");
const Message = require("../models/Message");

module.exports = {
  getMessages: async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: "desc" }).lean();
        res.render("groupChat.ejs", { user, messages: messages });
      } catch (err) {
        console.log(err);
      }
  },
  createMessage: async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      const { groupId, senderId, content, contentType } = req.body;
      await Message.create({
        content: contentType === 'text' ? content : undefined,
        image: contentType === 'image' ? result.secure_url : undefined,
        cloudinaryId: result.public_id,
        likes: 0,
        sender: senderId,
        group: groupId,
      });
      console.log("Message has been sent!");
      res.redirect("/groupChat");
    } catch (err) {
      console.log(err);
    }
  },
  likeMessage: async (req, res) => {
    try{
      const messageId = req.body.messageIdFromJSFile;
      const userId = req.user.id;
      const message = await Message.findOne({_id:message, likedBy: userId})
      if (message) {
          await Message.findOneAndUpdate(
              { _id: messageId, likedBy: userId },
              { $pull: { likedBy: userId }, $inc: { likes: -1 } }
          );
          console.log('User has already liked the message');
          res.status(400).json({ error: 'User has already liked the message' });
          return;
      }
      await Message.findOneAndUpdate(
          { _id: messageId },
          { $push: { likedBy: userId }, $inc: { likes: 1 } },
          { upsert: true }
      );
      console.log('Marked Like');
      res.json('Marked Like');
  }catch(err){
      console.log(err);
  };
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
