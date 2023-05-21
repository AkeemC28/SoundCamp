const cloudinary = require("../middleware/cloudinary");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const Team = require('../models/Team');

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const users = await User.find({});
      res.render("profile.ejs", { posts: posts, user: req.user, users: users });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getSearch: async (req, res) => {
    // try {
    if (!req.query.search) {
      req.query.search = ""
    }
    console.log(req.query)
    const posts = await Post.find({
      $or: [
        { title: { $regex: req.query.search, $options: "i" } },
        { caption: { $regex: req.query.search, $options: "i" } },
        { genre: { $elemMatch: { $regex: req.query.search, $options: "i" } } },
      ],
    });

    res.render("feed.ejs", { posts: posts });
    // } catch (err) {
    //   console.log(err);
    // }
  },

  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({ post: req.params.id });
      res.render("post.ejs", { post: post, user: req.user, comment: comments });
    } catch (err) {
      console.log(err);
    }
  },

  getTeam: async (req, res) => {
    try {
      
      let team =  await Team.findOne({ user: req.user.id })
console.log("team", team, req.user.id, req.user._id)
      if(!team){
        team = {members: []}
      }
      const members = []
      for(let i=0; i < team.members.length; i++){
        const member = await User.findById(team.members[i])
        members.push(member)
      }
      console.log("members",members)
      res.render("team.ejs", { members: members, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },

  addToTeam: async (req, res) => {
    try {
     
      await Team.updateOne(
        { user: req.user.id },
        { $push: { members: req.body.memberId } },
        { upsert: true })
      
      
        
      res.redirect("/team")
    } catch (err) {
      console.log(err);
    }
  },

  createPost: async (req, res) => {
    try {
      let imageResult;

      const { image, audio } = req.files;
      if (image) {
        imageResult = await cloudinary.uploader.upload(image[0].path);
      }
      const audioResult = await cloudinary.uploader.upload(audio[0].path, {
        resource_type: "video",
      });

      if (!Array.isArray(req.body.genre)) {
        req.body.genre = [req.body.genre];
      }
      // Create post with the appropriate URLs
      await Post.create({
        title: req.body.title,
        image: imageResult?.secure_url,
        audio: audioResult.secure_url,
        genre: req.body.genre,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });

      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },

  createComment: async (req, res) => {
    try {
      await Comment.create({
        comment: req.body.comment,
        user: req.user.id,
        post: req.params.id,
      });
      console.log("Comment has been added!");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },

  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log(req.params.id);
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};

// Upload image to Cloudinary
// if (req.file) {
// {
//     resource_type: "auto",
//   });
//   imageUrl = imageResult.secure_url;
// }

// Upload audio to Cloudinary
// if (req.file && req.file.fieldname == 'audio') {
//   const audioResult = await cloudinary.uploader.upload(req.file.path, {
//     resource_type: "video",
//     format: "mp3",
//   });
// audioUrl = audioResult.secure_url;
// }
