module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs", { landingPage: true , user:req.user});
  },
};
