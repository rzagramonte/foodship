module.exports = {
    getSafety: (req, res) => {
      res.render("safety.ejs", {user:req.user});
    },
  };