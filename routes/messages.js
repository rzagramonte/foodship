const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const messagesController = require("../controllers/messages");
const { ensureAuth } = require("../middleware/auth");

//Message Routes
router.get("/:chatId", ensureAuth, messagesController.getMessages);
router.post("/send", upload.single("file"), messagesController.postMessage);
router.patch("/edit/:messageId", messagesController.patchMessage);
router.delete("/delete/:messageId", messagesController.deleteMessage);

module.exports = router;
