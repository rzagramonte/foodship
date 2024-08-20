const Event = require("../models/Event");

module.exports = {
  getUserEvents: async (req, res) => { 
    console.log(req.user)
    try {
      const events = await Event.find({ user: req.user.id });
      res.render("userEvents.ejs", { events: events, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getGroupEvents: async (req, res) => { 
    console.log(req.user)
    try {
      const events = await Event.find({ ground: req.group.id });
      //Sending post data from mongodb and user data to ejs template
      res.render("groupEvent.ejs", { events: events, group: req.group });
    } catch (err) {
      console.log(err);
    }
  },
  getEvent: async (req, res) => {
    try {
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
      res.redirect("/groupChat");
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
        try {
          const { eventId } = req.params;
          const { newDate, newLocation } = req.body;
      
          // Create an update object dynamically
          const updateFields = {};
          if (newDate) updateFields.date = newDate;
          if (newLocation) updateFields.location = newLocation;
      
          // Update the event with the new date and/or location
          await Event.findByIdAndUpdate(
            { _id: eventId },
            { $set: updateFields },
            { new: true }
          );
      
          console.log("Event updated successfully!");
          res.redirect(`/events/${eventId}`);
        } catch (err) {
          console.log(err);
          res.status(500).send("Server error");
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
