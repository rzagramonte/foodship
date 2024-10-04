const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const groupChatsController = require("../controllers/groupChats");
const { ensureAuth } = require("../middleware/auth");

//Group chat Routes
router.get("/:id", ensureAuth, groupChatsController.getGroupChat);
router.post("/createGroupChat", upload.single("file"), groupChatsController.createGroupChat);
router.put("/updateGroupChatName/:id", groupChatsController.updateGroupChatName);
router.put("/updateGroupChatPic/:id", upload.single("file"), groupChatsController.updateGroupChatPic);
router.delete("/leaveGroupChat/:id", groupChatsController.leaveGroupChat);

module.exports = router;
