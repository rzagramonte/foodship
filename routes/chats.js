const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const chatsController = require("../controllers/chats");
const { patchGroupName } = require('../controllers/chats');
const { postChat } = require('../controllers/chats');
const { ensureAuth } = require("../middleware/auth");

router.post("/createChat", (req, res) => {
  postChat(req.app.get('io'))(req, res);  // Pass io to postChat
});
router.patch("/updateGroupName/:id", (req, res) => {
    patchGroupName(req.app.get('io'))(req, res);  // Pass io to patchGroupName
  });
router.patch("/updateGroupPic/:id", upload.single("file"), chatsController.patchGroupPic);
router.delete("/deleteChat/:id", chatsController.deleteChat);

module.exports = router;