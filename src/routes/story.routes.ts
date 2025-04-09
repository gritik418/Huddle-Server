import { Request, Response, Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { uploadStory } from "../config/multerConfig.js";
import multer from "multer";
import {
  addStory,
  deleteStory,
  getFollowingsStories,
  getOwnStories,
} from "../controllers/storyController.js";

const router = Router();

router.post("/", authenticate, function (req: Request, res: Response) {
  uploadStory(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      const messages: Record<string, string> = {
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

router.get("/me", authenticate, getOwnStories);

router.get("/followings", authenticate, getFollowingsStories);

router.delete("/:storyId", authenticate, deleteStory);

export default router;
