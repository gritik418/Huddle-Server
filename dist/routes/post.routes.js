import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { uploadPostMedia } from "../config/multerConfig.js";
import multer from "multer";
import { addPost } from "../controllers/postController.js";
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
export default router;
