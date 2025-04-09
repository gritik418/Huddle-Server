import { Request, Response } from "express";
import Story from "../models/Story.js";
import User from "../models/User.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getOwnStories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login.",
      });
    }

    const user = await User.findById(userId).select(
      "_id firstName lastName username profilePicture"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const stories = await Story.find({
      userId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: 1 })
      .populate("viewers", "_id firstName lastName username profilePicture");

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getFollowingsStories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user: User | null = await User.findById(userId).select("following");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const stories = await Story.find({
      userId: { $in: user.following },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: 1 })
      .populate("userId", "_id firstName lastName username profilePicture");

    const grouped: Record<string, any> = {};

    stories.forEach((story) => {
      const user = story.userId;

      if (!grouped[user._id]) {
        grouped[user._id] = {
          user,
          stories: [],
        };
      }

      grouped[user._id].stories.push({
        _id: story._id,
        caption: story.caption,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      });
    });

    const groupedStories = Object.values(grouped);

    return res.status(200).json({
      success: true,
      stories: groupedStories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const addStory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Missing file.",
      });
    }

    const { caption } = req.body;

    const fileUrl = `${process.env.BASE_URL}/uploads/${userId}/story/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

    await Story.create({
      userId,
      caption,
      mediaUrl: fileUrl,
      mediaType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return res.status(201).json({
      success: true,
      message: "Story added successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const deleteStory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.userId;
    const storyId: string = req.params.storyId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login.",
      });
    }

    if (!storyId) {
      return res.status(400).json({
        success: false,
        message: "Story Id is required.",
      });
    }

    const story: Story | null = await Story.findById(storyId);
    if (!story)
      return res.status(400).json({
        success: false,
        message: "Story not found.",
      });

    if (story.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this story.",
      });
    }

    if (story.mediaUrl) {
      const filePath = path.join(
        __dirname,
        "../../public",
        story?.mediaUrl.replace(/^.*\/uploads/, "uploads")
      );

      fs.promises.unlink(filePath).catch((err) => {
        console.warn("File deletion failed or not found:", err.message);
      });
    }

    await Story.findByIdAndDelete(storyId);

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
