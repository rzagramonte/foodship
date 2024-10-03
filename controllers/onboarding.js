const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");
const User = require("../models/User");

module.exports = {
  getAllOptions: async (req, res) => { 
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },

}