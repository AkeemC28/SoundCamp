const cloudinary = require("../middleware/cloudinary");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const Team = require('../models/Team');
const TeamPost = require('../models/TeamPost');
const { ObjectID } = require('mongodb');

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
  getHome: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const users = await User.find({});
      res.render("home.ejs", { posts: posts, user: req.user, users: users });
    } catch (err) {
      console.log(err);
    }
  },
  getAbout: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const users = await User.find({});
      res.render("about.ejs", { posts: posts, user: req.user, users: users });
    } catch (err) {
      console.log(err);
    }
  },
  getContact: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const users = await User.find({});
      res.render("contact.ejs", { posts: posts, user: req.user, users: users });
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
    console.log(req.params, "GET POST")
    try {
      const post = await Post.findById(req.params.id);
      console.log("GET POST", post)
      const comments = await Comment.find({ post: req.params.id });
      res.render("post.ejs", { post: post, user: req.user, comment: comments});
    } catch (err) {
      console.log(err);
    }
  },

  getTeam: async (req, res) => {
    try {
      
      let team =  await Team.findOne({ user: req.user.id })
      const teamPosts = await TeamPost.find({ team: team.id });
      if(!team){
        team = {members: []}
      }
      const members = []
      for(let i=0; i < team.members.length; i++){
        const member = await User.findById(team.members[i])
        members.push(member)
      }
      console.log("members",members)
      res.render("team.ejs", { members: members, user: req.user, posts: teamPosts, team: team});
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
      console.log(imageResult)
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
        imageId: imageResult?.public_id,
        audioId: audioResult.public_id,
        genre: req.body.genre,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
        userName: req.user.userName
      });

      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },

  createTeamPost: async (req, res) => {
    try {

      console.log("req.params.team",req.params.team)
      let imageResult;

      const { image, audio } = req.files;
      if (image) {
        imageResult = await cloudinary.uploader.upload(image[0].path);
      }
      console.log(imageResult)
      const audioResult = await cloudinary.uploader.upload(audio[0].path, {
        resource_type: "video",
      });

      if (!Array.isArray(req.body.genre)) {
        req.body.genre = [req.body.genre];
      }
      // Create post with the appropriate URLs
      await TeamPost.create({
        title: req.body.title,
        image: imageResult?.secure_url,
        audio: audioResult.secure_url,
        imageId: imageResult?.public_id,
        audioId: audioResult.public_id,
        genre: req.body.genre,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
        team: req.params.teamId,
        userName: req.user.userName
      });
      
      console.log(" Team Post has been added!");
      res.redirect("/team");
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

  // changePost: async (req, res) => {
  //   try {
  //     await Post.findOneAndUpdate(
  //       { _id: req.params.id },
  //      req.body
  //     );
  //     console.log(req.body);
  //     res.redirect(`/post/${req.params.id}`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },

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

  updateStatus: async (req, res) => {
    console.log(req.body)
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          status: req.body.status,
        }
      );
      console.log("Status changed!");
      console.log("STATUS",req.body.status)
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },

  removeFromTeam: async (req, res) => {
    const idToRemove = req.params.id;

// Create a new MongoDB ObjectID from the idToRemove
const memberId = idToRemove
console.log(req.params.id)
// Define the update operation
const updateOperation = {
  $pull: {
    members: memberId,
  },
};

// Update the document in the 'team' collection
const result = await Team.updateOne({user: req.user.id}, updateOperation);
console.log(result)
res.redirect("/team");
// Check the result
if (result.modifiedCount > 0) {
  console.log('Member removed successfully.');
} else {
  console.log('Member not found or removal operation failed.');
}
},


  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById(req.params.id);
      console.log(post)
      // Delete image from cloudinary
      if(post.imageId){
        await cloudinary.uploader.destroy(post.imageId)
      }
      
      await cloudinary.uploader.destroy(post.audioId);

      const result = await Post.findByIdAndRemove(req.params.id);
      // console.log(result)
      console.log(req.params.id);
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
      res.redirect("/profile");
    }
  },
}


