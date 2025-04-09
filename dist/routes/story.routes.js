import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { uploadStory } from "../config/multerConfig.js";
import multer from "multer";
import { addStory, getFollowingsStories, } from "../controllers/storyController.js";
const router = Router();
router.post("/", authenticate, function (req, res) {
    uploadStory(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            const messages = {
                LIMIT_FILE_SIZE: "File size is too large (max 5MB).",
                LIMIT_FILE_COUNT: "Too many files uploaded.",
                LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
            };
            return res.status(400).json({
                success: false,
                message: messages[err.code] || "Multer upload error.",
            });
        }
        if (err instanceof Error) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        addStory(req, res);
    });
});
router.get("/followings", authenticate, getFollowingsStories);
export default router;
