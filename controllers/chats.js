const cloudinary = require("../middleware/cloudinary");
const Chat = require("../models/Chat");
const User = require("../models/User");

module.exports = {
  getChats: async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.user.id });
      let chat;
      res.render("profile.ejs", {
        chats,
        chat,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getChat: async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id);
      res.render("chat.ejs", {
        chat,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  postChat: async (req, res) => {
    try {
      const { preferences } = req.user;
      const { id } = req.params;
      console.log("1:", req.user, "2:", id)
      //add the user interests and foodPreferences to the user doc as well
      const chatMatch = await Chat.findOne({
        $and: [
          { $expr: { $lt: [{ $size: "$members" }, 6] } }, // Ensures less than 6 members
          {
            members: {
              $elemMatch: {
                interests: { $in: preferences.interests }, // Matches at least one interest
                foodPreferences: { $in: preferences.foodPreferences }, // Matches at least one food preference
              },
            },
          },
        ],
      });
      console.log("chatMatch:", chatMatch)
      if (chatMatch) {
        // Add the userId to the members array
        chatMatch.members.push(id);
        // Save the updated chat document
        await chatMatch.save();
        console.log("User has been added to the chat!");
        res.redirect(`chat/${chatMatch.id}`);
      } else {
        const chat = await Chat.create({
          members: [id],
          foodPreference: preferences.foodPreferences,
          interests: preferences.interests,
        });
        await User.findByIdAndUpdate(id, {$push: {chatIds: chat.id}});
        console.log("Chat has been created!");
        res.render("chat.ejs", {
          chat,
          user: req.user,
          landingPage: false,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
  patchGroupName: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { name } = req.body;
      // Find the group and update the name
      await Group.findByIdAndUpdate(chatId, { name }, { new: true });
      console.log("Chat name has been updated!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  patchGroupPic: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path
      );
      // Find the group and update the name
      await Chat.findByIdAndUpdate({
        chatId,
        secure_url,
        public_id,
      });
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
