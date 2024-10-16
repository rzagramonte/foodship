const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const chatController = require("../controllers/chat");
const { ensureAuth } = require("../middleware/auth");

//Events routes

router.get("/:id", ensureAuth, chatController.getChat);
router.post("/createChat", chatController.postChat);
router.put("/updateGroupName/:id", chatController.putGroupName);
router.put("/updateGroupPic/:id", upload.single("file"), chatController.updateGroupPic);
router.delete("/leaveChat/:id", chatController.leaveChat);

module.exports = router;
