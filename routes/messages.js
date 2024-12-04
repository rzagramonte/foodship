const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const messagesController = require("../controllers/messages");
const { ensureAuth } = require("../middleware/auth");
const { postMessage } = require('../controllers/messages');

//Message Routes
router.get("/:chatId", ensureAuth, messagesController.getMessages);
router.post("/send", upload.single("file"), (req, res) => {
    postMessage(req.app.get('io'))(req, res);  // Pass io to postMessage
  });
router.patch("/edit/:messageId", messagesController.patchMessage);
router.delete("/delete/:messageId", messagesController.deleteMessage);

module.exports = router;
