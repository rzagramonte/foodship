const Event = require("../models/Event");
const Restaurant = require("../models/Restaurant");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");
const scheduleQuestions = require("../jobs/questions");

module.exports = {
  getEvents: async (req, res) => {
    try {
      const events = await Event.find({ chatId: req.params.chatId }).populate({ path: "restaurant", select: "name address borough" });
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
      const chat = await Chat.findById(chatId).populate({ path: "cuisines", select: "cuisine" });
      const cuisines = chat.cuisines.map((c) => c.cuisine);
      const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
      const restaurant = await Restaurant.findOne({ cuisine: cuisine });
      const event = await Event.create({
        chatId,
        restaurant,
        date,
      });
      const systemMessage = await Message.create({
        chatId,
        content: `${user.userName} created an event for ${date} at ${event.restaurant.name}: ${event.restaurant.address.building} ${event.restaurant.address.street}, ${event.restaurant.borough}, NY ${event.restaurant.address.zipcode}.`,
        contentType: "text",
      });
      await Chat.findByIdAndUpdate(chatId, {
        $push: { events: event._id },
        $push: { messages: systemMessage._id },
      });
      await User.findByIdAndUpdate(user._id, {
        $push: { events: event._id },
      });
      scheduleQuestions({ chatId, eventId: event._id, eventDate: event.date });
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
  postEventQuestion: async (req) => {
    const io = require('../server');
    const { chatId, question } = req;
    try {
      const savedQuestion = await Message.create({
        chatId,
        content: question,
        contentType: "text",
      });
      await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: savedQuestion._id },
      });
      io.emit("question", savedQuestion, chatId);
      return savedQuestion;
    } catch (err) {
      console.log(err);
    }
  },
};
