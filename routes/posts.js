const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//Post Routes - simplified for now

router.get("/search", ensureAuth, postsController.getSearch);

router.get("/:id", ensureAuth, postsController.getPost);

router.post("/createPost", upload.fields([{name:'image'},{name:'audio'}]), postsController.createPost);

router.post("/createComment/:id", postsController.createComment);

router.post("/createTeamPost/:teamId", upload.fields([{name:'image'},{name:'audio'}]),postsController.createTeamPost);

router.put("/likePost/:id", postsController.likePost);
router.put("/updateStatus/:id", postsController.updateStatus);

router.delete("/deletePost/:id", postsController.deletePost); 

module.exports = router;
