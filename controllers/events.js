const Event = require("../models/Event");
const Restaurant = require("../models/Restaurant");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

module.exports = {
  getEvents: async (req, res) => {
    try {
      const events = await Event.find({ chatId: req.params.chatId });
      return events;
    } catch (err) {
      console.log(err);
    }
  },
  getEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.chatId);
      return event;
    } catch (err) {
      console.log(err);
    }
  },
  postEvent: (io) => async (req, res) => {
    try {
      const { user } = req;
      const { chatId, date } = req.body;
      console.log(req.body);

      const foodPreference = await Restaurant.findOne({
        foodPreferences: { $in: user.preferences.foodPreferences },
      });
      const i = myArray[Math.floor(Math.random() * myArray.length)];
      const restaurant = await Restaurant.findOne({
        foodPreferences: { $in: foodPreference },
      });
      const event = await Event.create({
        restaurant,
        date,
      });
      const systemMessage = await Message.create({
        chatId,
        content: `${user.userName} created an event for ${new Date(event.date).toLocaleString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
        })} at ${event.restaurant}.`,

        contentType: "text",
      });

      await Chat.findByIdAndUpdate(chatId, {
        $push: { events: event._id },
        $push: { messages: systemMessage._id },
      });
      await User.findByIdAndUpdate(user._id, {
        $push: { events: event._id },
      });
      console.log("Event has been created!");
      res.status(201).json({ restaurant, event, systemMessage, user });
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
