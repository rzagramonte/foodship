const cloudinary = require("../middleware/cloudinary");
const Event = require("../models/Event");

module.exports = {
  getEvents: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      const events = await Event.find({ user: req.user.id });
      //Sending post data from mongodb and user data to ejs template
      res.render("events.ejs", { events: events, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getEvent: async (req, res) => {
    try {
      //id parameter comes from the post routes
      //router.get("/:id", ensureAuth, postsController.getPost);
      //http://localhost:2121/post/631a7f59a3e56acfc7da286f
      //id === 631a7f59a3e56acfc7da286f
      const event = await Event.findById(req.params.id);
      res.render("event.ejs", { event: event, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  createEvent: async (req, res) => {
    try {
      await Event.create({
        date: req.body.date,
        location: result.secure_url
      });
      console.log("Event has been created!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  editEvent: async (req, res) => {
    try {
      await Event.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/event/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteEvent: async (req, res) => {
    try {
      // Find event by id
      let event = await Event.findById({ _id: req.params.id });
      // Delete event from db
      await Event.remove({ _id: req.params.id });
      console.log("Deleted Event");
      res.redirect("/chat");
    } catch (err) {
      res.redirect("/chat");
    }
  },
};
