const Event = require("../models/Event");
const Restaurant = require("../models/Restaurant");

module.exports = {
  getEvents: async (req, res) => {
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
  postEvent: (io) => async (req, res) => {
    try {
      const { user } = req;
      const restaurant = await Restaurant.findOne({
        foodPreferences: { $in: user.preferences.foodPreferences },
      });
      const event = await Event.create({
        restaurant,
        date: req.body.date,
      });
      const systemMessage = await Message.create({
        chatId: req.chat._id,
        content: `${user.userName} created event: ${event}.`,
        contentType: "text",
      });

      await Chat.findByIdAndUpdate(req.chat._id, {
        $push: { events: event._id },
        $push: { messages: systemMessage._id },
      });
      await User.findByIdAndUpdate(user._id, {
        $push: { events: event._id },
      });
      console.log("Event has been created!");
      res.status(201).json({ restaurant, event, systemMessage, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  patchEvent: async (req, res) => {
    try {
      const { eventId } = req.params;
      const { newDate, newLocation } = req.body;
      const updateFields = {};
      if (newDate) updateFields.date = newDate;
      if (newLocation) updateFields.location = newLocation;
      await Event.findByIdAndUpdate({ _id: eventId }, { $set: updateFields }, { new: true });
      console.log("Event updated successfully!");
      res.redirect(`/event/${eventId}`);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  },
  deleteEvent: async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.id);
      console.log("Deleted Event");
      res.redirect(`/chat/${req.params.chatId}`);
    } catch (err) {
      console.error("Error deleting event:", err);
      res.redirect(`/chat/${req.params.chatId}`);
    }
  },
};
