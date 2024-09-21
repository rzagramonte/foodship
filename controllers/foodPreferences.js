const FoodPreference = require("../models/FoodPreference");

module.exports = {
  getFoodPreference: async (req, res) => { 
    console.log(req.user)
    try {
      const foodPreference = await FoodPreference.find();
      res.render("onboarding.ejs", { foodPreference: foodPreference, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
}