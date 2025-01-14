const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { getEvents, getEvent, postEvent, patchEvent, deleteEvent } = require("../controllers/events");

//Events routes
router.get("/", ensureAuth, getEvents);
router.get("/:id", ensureAuth, getEvent);
router.post("/createEvent", ensureAuth, (req, res) => {
    postEvent(req.app.get("io"))(req, res)}); // Pass io to postEvent);
router.patch("/updateEvent/:id", patchEvent);
router.delete("/deleteEvent/:id", deleteEvent);

module.exports = router;
