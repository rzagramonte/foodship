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
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      //media is stored on cloudainary - the above request responds with url to media and the media id that you will need when deleting content 
      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  leaveGroup: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
};
