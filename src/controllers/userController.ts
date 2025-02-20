import { Request, Response } from "express";
import User from "../models/User.js";
import updateUserSchema, {
  UpdateUserData,
} from "../validators/updateUserSchema.js";

export const getUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user: User | null = await User.findById(userId).select({
      followRequests: 1,
      followers: 1,
      following: 1,
      _id: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      email: 1,
      posts: 1,
      friendRequests: 1,
      friends: 1,
      blockedUsers: 1,
      profilePicture: 1,
      coverImage: 1,
    });

    if (!user || !user._id) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getUserByUsername = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const username: string = req.params.username;

    const user: User | null = await User.findOne({
      username,
      isVerified: true,
    }).select({
      followers: 1,
      following: 1,
      _id: 1,
      bio: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      email: 1,
      posts: 1,
      profilePicture: 1,
    });

    if (!user || !user._id) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getFollowing = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user: User | null = await User.findById(userId)
      .select({
        following: 1,
        _id: 1,
      })
      .populate("following", "_id firstName lastName username profilePicture");

    return res.status(200).json({
      success: true,
      following: user?.following || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getFollowers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user: User | null = await User.findById(userId)
      .select({
        followers: 1,
        _id: 1,
      })
      .populate("followers", "_id firstName lastName username profilePicture");

    return res.status(200).json({
      success: true,
      followers: user?.followers || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getActiveMembers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user: User | null = await User.findById(userId)
      .select({
        chatMembers: 1,
        _id: 0,
      })
      .populate("chatMembers", "_id isActive");

    const activeMembers: string[] = [];

    user?.chatMembers?.forEach((member: { _id: string; isActive: boolean }) => {
      if (member.isActive) {
        if (!activeMembers.includes(member._id.toString())) {
          activeMembers.push(member._id.toString());
        }
      }
    });

    return res.status(200).json({
      success: true,
      activeMembers: activeMembers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const data: UpdateUserData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const result = updateUserSchema.safeParse(data);

    if (!result.success) {
      const errors: { [name: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation Error.",
        errors,
      });
    }

    const { firstName, lastName, username, bio } = result.data;

    const updateData: {
      firstName?: string;
      lastName?: string;
      username?: string;
      coverImage?: string;
      profilePicture?: string;
      bio?: string;
    } = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;

    if (username) {
      const checkExisting = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (checkExisting) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken. Please choose a different one.",
        });
      }
      updateData.username = username;
    }

    if (
      req.files &&
      !Array.isArray(req.files) &&
      typeof req.files === "object"
    ) {
      if (req.files["profilePicture"]) {
        const profilePicturePath = `${process.env.BASE_URL}/uploads/${userId}/profilePicture/${req.files["profilePicture"][0].originalname}`;
        updateData.profilePicture = profilePicturePath;
      }
      if (req.files["coverImage"]) {
        const coverImagePath = `${process.env.BASE_URL}/uploads/${userId}/coverImage/${req.files["coverImage"][0].originalname}`;
        updateData.coverImage = coverImagePath;
      }
    }

    await User.findByIdAndUpdate(userId, {
      $set: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
