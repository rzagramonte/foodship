const cloudinary = require("../middleware/cloudinary");
const Chat = require("../models/Chat");

module.exports = {
  getChats: async (req, res) => { 
    try {
      const chats = await Chat.find({ members: req.user.id, });
      res.render("profile.ejs", { chats: chats, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  getChat: async (req, res) => {
    try {
      //const group = await Group.findById(req.params.id);
      res.render("chat.ejs", { 
        //group: group, 
        user: req.user, 
        landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  postChat: async (req, res) => {
    //math.random, limit six, some() interest match
    //find group with highest interest match, if group exists and members length is under 6, add user to group, else create new group
    try {
      const {members, preferences} = req.body;

      await Chat.create({
        members,
        preferences
      });
      console.log("Chat has been added!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  patchGroupName: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { name } = req.body;
      // Find the group and update the name
      await Group.findByIdAndUpdate(
        chatId,
            { name },
            { new: true }
          );
      console.log("Chat name has been updated!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  patchGroupPic: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path);
      // Find the group and update the name
      await Chat.findByIdAndUpdate({
        chatId,
        secure_url,
        public_id,
      }
          );
      console.log("Chat pic has been updated!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  deleteChat: async (req, res) => {
    try {
      const { chatId, userId } = req.params;
      await Chat.findByIdAndUpdate(
        { _id: chatId },
        { $pull: { user: userId } },
        { upsert: true }        
      );
      console.log("Left chat :(");
      res.redirect(`/profile`);
    } catch (err) {
      console.log(err);
    }
  },
};
