const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const chatsController = require("../controllers/chats");
const { ensureAuth } = require("../middleware/auth");

router.get("/:id", ensureAuth, chatsController.getChat);
router.post("/createChat", chatsController.postChat);
router.patch("/updateGroupName/:id", chatsController.patchGroupName);
router.patch("/updateGroupPic/:id", upload.single("file"), chatsController.patchGroupPic);
router.delete("/deleteChat/:id", chatsController.deleteChat);

module.exports = router;
