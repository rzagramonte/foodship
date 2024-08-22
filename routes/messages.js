const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const messagesController = require("../controllers/messages");
const { ensureAuth } = require("../middleware/auth");

//Message Routes
router.get("/messages", ensureAuth, messagesController.getMessages);
router.post("/createMessage", upload.single("file"), messagesController.createMessage);
router.put("/likeMessage/:id", messagesController.likeMessage);
router.delete("/deleteMessage/:id", messagesController.deleteMessage);

module.exports = router;
