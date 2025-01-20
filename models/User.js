const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userStatus: {
    type: String,
    enum: ["online", "idle", "dnd", "invisible"],
    default: "online",
  },
  bio: { type: String },
  profilePic: { type: String },
  cloudinaryId: { type: String },
  preferences: {
    cuisines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cuisine" }],
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],
  },
  location: {
    city: { type: String },
    state: { type: String },
    zip: { type: Number },
  },
  chatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

// Password hash middleware.
UserSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Helper method for validating user's password.
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);
