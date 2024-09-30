module.exports = {
    getSafety: (req, res) => {
      res.render("safety.ejs", {landingPage: false, user:req.user});
    },
  };