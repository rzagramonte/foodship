const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");

module.exports = {
  getOptions: async (req, res) => { 
    console.log(req.user)
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  postUserPreferences: async (req, res) => { 
    console.log(req.user)
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  updateUserPreferences: async (req, res) => { 
    console.log(req.user)
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  deleteUserPreferences: async (req, res) => { 
    console.log(req.user)
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },
}