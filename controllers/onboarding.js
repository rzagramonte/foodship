const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");

module.exports = {
  getPreferences: async (req, res) => { 
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
    } catch (err) {
      console.log(err);
    }
  },

}