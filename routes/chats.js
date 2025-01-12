const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { ensureAuth } = require("../middleware/auth");
const { patchGroupName, patchGroupPic, postChat, deleteChat } = require("../controllers/chats");

router.post("/createChat", ensureAuth, (req, res) => {
  postChat(req.app.get("io"))(req, res); // Pass io to postChat
});
router.patch("/updateGroupName/:id", ensureAuth, (req, res) => {
  patchGroupName(req.app.get("io"))(req, res); // Pass io to patchGroupName
});
router.patch("/updateGroupPic/:id", ensureAuth, upload.single("file"), (req, res) => {
  patchGroupPic(req.app.get("io"))(req, res); // Pass io to patchGroupPic
});
router.delete("/deleteChat/:id", ensureAuth, (req, res) => {
  deleteChat(req.app.get("io"))(req, res); // Pass io to deleteChat
});

module.exports = router;
