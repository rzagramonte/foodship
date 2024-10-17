const Event = require("../models/Event");

module.exports = {
  getEvents: async (req, res) => {
    console.log(req.user);
    try {
      const events = await Event.find({ ground: req.group.id });
      res.render("events.ejs", {
        user: req.user,
        events: events,
        group: req.group,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      res.render("event.ejs", { event: event, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  postEvent: async (req, res) => {
    try {
      await Event.create({
        date: req.body.date,
        location: result.secure_url,
      });
      console.log("Event has been created!");
      res.redirect("/groupChat");
    } catch (err) {
      console.log(err);
    }
  },
  patchEvent: async (req, res) => {
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
      res.redirect(`/event/${eventId}`);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  },
  deleteEvent: async (req, res) => {
    try {
      // Delete event by id
      await Event.findByIdAndDelete(req.params.id);
      console.log("Deleted Event");
      res.redirect("/chat");
    } catch (err) {
      console.error("Error deleting event:", err);
      res.redirect(`/chat/${req.params.chatId}`);
    }
  },
};
