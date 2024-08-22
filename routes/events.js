const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const groupChatsController = require("../controllers/groupChats");
const { ensureAuth } = require("../middleware/auth");

//Events routes
router.get("/:id", ensureAuth, groupChatsController.getGroupChat);
router.post("/createGroupChat", upload.single("file"), groupChatsController.createGroupChat);
router.put("/updateGroupChatName/:id", groupChatsController.updateGroupChatName);
router.put("/updateGroupChatPic/:id", groupChatsController.updateGroupChatPic);
router.delete("/leaveGroupChat/:id", groupChatsController.leaveGroupChat);

module.exports = router;
