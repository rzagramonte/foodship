const cloudinary = require("../middleware/cloudinary");
const Group = require("../models/Group");

module.exports = {
  getGroups: async (req, res) => { 
    console.log(req.user)
    try {
      const groups = await Group.find({ user: req.user.id });
      res.render("profile.ejs", { groups: groups, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);
      res.render("chat.ejs", { group: group, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  createGroup: async (req, res) => {
    try {
      const {members, preferences} = request.body;

      await Group.create({
        members,
        preferences
      });
      console.log("Group has been added!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  updateGroupName: async (req, res) => {
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
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  updateGroupPic: async (req, res) => {
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
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  leaveGroup: async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      await Group.findByIdAndUpdate(
        { _id: groupId },
        { $pull: { user: userId } },
        { upsert: true }        
      );
      console.log("Left group :(");
      res.redirect(`/profile`);
    } catch (err) {
      console.log(err);
    }
  },
};
