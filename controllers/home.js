module.exports = {
  //Renders the landing page
  getIndex: (req, res) => {
    res.render("index.ejs", { landingPage: true , user:req.user });
  },
  //Renders about page
  getAbout: (req, res) => {
    res.render("about.ejs", { landingPage: false, user:req.user });
  },
  //Renders learn page
  getLearn: (req, res) => {
    res.render("learn.ejs", { landingPage: false, user:req.user });
  },
  //Renders safety page
  getSafety: (req, res) => {
    res.render("safety.ejs", { landingPage: false, user:req.user });
  },
};
