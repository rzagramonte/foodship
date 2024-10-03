const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");
const User = require("../models/User");


module.exports = {
    addUserPreferences: async (req, res) => { 
        try {
          const user = await User.find({ user: req.user.id,  });
          const interests = await Interest.find();
          const foodPreferences = await FoodPreference.find();
          res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
        } catch (err) {
          console.log(err);
        }
      },
      updateUserPreferences: async (req, res) => { 
        try {
          const interests = await Interest.find();
          const foodPreferences = await FoodPreference.find();
          res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
        } catch (err) {
          console.log(err);
        }
      },
      deleteUserPreferences: async (req, res) => { 
        try {
          const interests = await Interest.find();
          const foodPreferences = await FoodPreference.find();
          res.render("onboarding.ejs", { interests: interests, foodPreferences: foodPreferences, user: req.user, landingPage: false });
        } catch (err) {
          console.log(err);
        }
      },

}