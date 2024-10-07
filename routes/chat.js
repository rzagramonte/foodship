const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const chatController = require("../controllers/chat");
const { ensureAuth } = require("../middleware/auth");

//Group chat Routes
//:id
router.get("/", ensureAuth, chatController.getChat);
router.post("/createChat", chatController.createChat);
router.put("/updateGroupName/:id", chatController.updateGroupName);
router.put("/updateGroupPic/:id", upload.single("file"), chatController.updateGroupPic);
router.delete("/leaveChat/:id", chatController.leaveChat);

module.exports = router;
