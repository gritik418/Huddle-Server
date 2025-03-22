import { Request, Response, Router } from "express";
import multer from "multer";
import { uploadUserAvatarOrCoverImage } from "../config/multerConfig.js";
import {
  blockUser,
  getActiveMembers,
  getFollowers,
  getFollowing,
  getPostsByUser,
  getUser,
  getUserByUsername,
  getUsersForMention,
  toggleMentionsAllowance,
  unfollow,
  updateAccountPrivacy,
  updateActiveStatusVisibility,
  updateUser,
} from "../controllers/userController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getUser);

router.get("/:id/posts", authenticate, getPostsByUser);

router.get("/mentions", authenticate, getUsersForMention);

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
    } else if (err instanceof Error) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    updateUser(req, res);
  });
});

router.get("/following", authenticate, getFollowing);

router.get("/followers", authenticate, getFollowers);

router.get("/active", authenticate, getActiveMembers);

router.get("/:username", authenticate, getUserByUsername);

router.post("/account/privacy", authenticate, updateAccountPrivacy);

router.post("/account/allow-mentions", authenticate, toggleMentionsAllowance);

router.post(
  "/account/active-status-visibility",
  authenticate,
  updateActiveStatusVisibility
);

router.delete("/:followingId/unfollow", authenticate, unfollow);

router.post("/:id/block", authenticate, blockUser);

export default router;
