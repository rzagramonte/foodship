const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events");
const { ensureAuth } = require("../middleware/auth");

//Events routes
router.get("/", ensureAuth, eventsController.getEvents);
router.get("/:id", ensureAuth, eventsController.getEvent);
router.post("/createEvent", eventsController.postEvent);
router.patch("/updateEvent/:id", eventsController.patchEvent);
router.delete("/deleteEvent/:id", eventsController.deleteEvent);

module.exports = router;