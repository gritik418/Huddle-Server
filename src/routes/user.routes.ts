import { Router, Request, Response } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getActiveMembers,
  getFollowers,
  getFollowing,
  getUser,
  getUserByUsername,
  updateUser,
} from "../controllers/userController.js";
import { uploadUserAvatarOrCoverImage } from "../config/multerConfig.js";
import multer from "multer";

const router = Router();

router.get("/", authenticate, getUser);

router.put("/", authenticate, function (req: Request, res: Response) {
  uploadUserAvatarOrCoverImage(req, res, function (err) {
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
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: "Unexpected server error. Please try again later.",
      });
    }
    updateUser(req, res);
  });
});

router.get("/following", authenticate, getFollowing);

router.get("/followers", authenticate, getFollowers);

router.get("/active", authenticate, getActiveMembers);

router.get("/:username", authenticate, getUserByUsername);

export default router;
