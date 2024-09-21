const mongoose = require("mongoose");

const FoodPreferenceSchema = new mongoose.Schema({
  foodPreference: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("FoodPreference", FoodPreferenceSchema);
