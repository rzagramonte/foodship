const Connection = require("../models/Connection");

module.exports = {
  getConnection: async (req, res) => {
    try {
      //find a random one (for now) and return
      const connection = await Connection.findById(req.params.id);
      res.render("connection.ejs", { user: req.user, connection: connection, sendTo: req.user });
    } catch (err) {
      console.log(err);
    }
  },
};
