const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get("/home", ensureAuth, postsController.getHome);
router.get("/about", ensureAuth, postsController.getAbout);
router.get("/contact", ensureAuth, postsController.getContact);
router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
router.get("/team", postsController.getTeam);
router.put("/addToTeam", postsController.addToTeam);
router.put("/removeFromTeam/:id", postsController.removeFromTeam); 
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
