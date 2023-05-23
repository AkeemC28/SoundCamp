const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  members: [],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
  },
});

module.exports = mongoose.model("Team", TeamSchema);
