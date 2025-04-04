import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { createGroup, deleteGroup, getGroupById, leaveGroup, } from "../controllers/groupController.js";
import { uploadGroupIcon } from "../config/multerConfig.js";
import multer from "multer";
const router = Router();
router.get("/:groupId", authenticate, getGroupById);
router.post("/", authenticate, function (req, res) {
    uploadGroupIcon(req, res, function (err) {
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
        createGroup(req, res);
    });
});
router.delete("/:groupId", authenticate, deleteGroup);
router.put("/leave/:groupId", authenticate, leaveGroup);
export default router;
