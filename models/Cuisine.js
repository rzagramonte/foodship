const mongoose = require("mongoose");

const CuisineSchema = new mongoose.Schema({
  cuisine: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Cuisine", CuisineSchema);
