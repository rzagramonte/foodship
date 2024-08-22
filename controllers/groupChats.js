const cloudinary = require("../middleware/cloudinary");
const Group = require("../models/GroupChat");

module.exports = {
  getGroupChats: async (req, res) => { 
    console.log(req.user)
    try {
      const groups = await Group.find({ user: req.user.id });
      res.render("profile.ejs", { groups: groups, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getGroupChat: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);
      res.render("groupChat.ejs", { group: group, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  createGroupChat: async (req, res) => {
    //math.random, limit six, some interest match
    //find group with highest interest match, if group exists and members length is under 6, add user to group, else create new group
    try {
      const {members, preferences} = request.body;

      await Group.create({
        members,
        preferences
      });
      console.log("Group has been added!");
      res.redirect("/groupChat");
    } catch (err) {
      console.log(err);
    }
  },
  updateGroupChatName: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      // Find the group and update the name
      await Group.findByIdAndUpdate(
        groupId,
            { name },
            { new: true }
          );
      console.log("Group name has been updated!");
      res.redirect("/groupChat");
    } catch (err) {
      console.log(err);
    }
  },
  updateGroupChatPic: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path);
      // Find the group and update the name
      await Group.findByIdAndUpdate({
        groupId,
        secure_url,
        public_id,
      }
          );
      console.log("Group pic has been updated!");
      res.redirect("/groupChat");
    } catch (err) {
      console.log(err);
    }
  },
  leaveGroupChat: async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      await Group.findByIdAndUpdate(
        { _id: groupId },
        { $pull: { user: userId } },
        { upsert: true }        
      );
      console.log("Left groupchat :(");
      res.redirect(`/onboarding`);
    } catch (err) {
      console.log(err);
    }
  },
};
