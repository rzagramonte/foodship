module.exports = {
  //Renders the landing page
  getIndex: (req, res) => {
    if (req.user) return res.redirect("/profile");
    res.render("index.ejs", { chats: false, landingPage: true, user: null });
  },
  //Renders about page
  getAbout: (req, res) => {
    res.render("about.ejs", { chats: false, landingPage: false, user: req.user });
  },
  //Renders learn page
  getLearn: (req, res) => {
    res.render("learn.ejs", { chats: false, landingPage: false, user: req.user });
  },
  //Renders safety page
  getSafety: (req, res) => {
    res.render("safety.ejs", { chats: false, landingPage: false, user: req.user });
  },
};
