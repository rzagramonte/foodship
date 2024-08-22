const Connection = require("../models/Connection");

module.exports = {
  getConnection: async (req, res) => {
    try {
      //id parameter comes from the post routes
      //router.get("/:id", ensureAuth, postsController.getPost);
      //http://localhost:2121/post/631a7f59a3e56acfc7da286f
      //id === 631a7f59a3e56acfc7da286f
      const connection = await Connection.findById(req.params.id);
      res.render("connection.ejs", { user, connection: connection, sendTo: req.user});
    } catch (err) {
      console.log(err);
    }
  },

};
