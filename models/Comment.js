const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

  comment: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  post: {
    type: String,
    ref: 'Post',
    required: true
  },
  user: {
    type: String,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userName: { 
    type: String, 
    unique: true 
  },
});

module.exports = mongoose.model('Comment', commentSchema);
