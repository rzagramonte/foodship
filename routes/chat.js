const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const chatController = require("../controllers/chat");
const { ensureAuth } = require("../middleware/auth");

//Group chat Routes
//:id
router.get("/", ensureAuth, chatController.getChat);
router.post("/createChat", chatController.postChat);
router.put("/updateGroupName/:id", chatController.putGroupName);
router.put("/updateGroupPic/:id", upload.single("file"), chatController.putGroupPic);
router.delete("/leaveChat/:id", chatController.deleteChat);

module.exports = router;
