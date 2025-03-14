import { Router } from "express";
import multer from "multer";
import { uploadPostMedia } from "../config/multerConfig.js";
import { addPost, deletePost, getFeed, getPostById, getPosts, getPostsByFollowing, likePost, unlikePost, } from "../controllers/postController.js";
import authenticate from "../middlewares/authenticate.js";
const router = Router();
router.post("/", authenticate, function (req, res) {
    uploadPostMedia(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            switch (err.code) {
                case "LIMIT_FILE_SIZE":
                    return res.status(400).json({
                        success: false,
                        message: "File size is too large.",
                    });
                case "LIMIT_FILE_COUNT":
                    return res.status(400).json({
                        success: false,
                        message: "Too many files uploaded.",
                    });
                case "LIMIT_UNEXPECTED_FILE":
                    return res.status(400).json({
                        success: false,
                        message: "Unexpected file field.",
                    });
                default:
                    return res.status(400).json({
                        success: false,
                        message: "An error occurred during the file upload.",
                    });
            }
        }
        else if (err instanceof Error) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        addPost(req, res);
    });
});
router.get("/", authenticate, getPosts);
router.get("/feed", authenticate, getFeed);
router.get("/following", authenticate, getPostsByFollowing);
router.get("/:postId", authenticate, getPostById);
router.delete("/:postId", authenticate, deletePost);
router.post("/:postId/like", authenticate, likePost);
router.delete("/:postId/like", authenticate, unlikePost);
export default router;
