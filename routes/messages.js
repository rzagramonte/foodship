const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { ensureAuth } = require("../middleware/auth");
const { getMessages } = require("../controllers/profile");
const { postMessage, patchMessage, deleteMessage } = require("../controllers/messages");

//Message Routes
router.get("/:chatId", ensureAuth, getMessages);
router.post("/send", ensureAuth, upload.single("file"), (req, res) => {
  postMessage(req.app.get("io"))(req, res); // Pass io to postMessage
});
router.patch("/edit/:messageId", ensureAuth, patchMessage);
router.delete("/delete/:messageId", ensureAuth, deleteMessage);

module.exports = router;
