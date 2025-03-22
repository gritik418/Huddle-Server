import { Request, Response } from "express";
import User from "../models/User.js";
import updateUserSchema, {
  UpdateUserData,
} from "../validators/updateUserSchema.js";
import Post from "../models/Post.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

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
      isPrivate: 1,
      showActiveStatus: 1,
      allowMentions: 1,
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

export const getPostsByUser = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;

    const posts = await Post.find({ userId: id }).populate(
      "userId",
      "_id firstName lastName username coverImage profilePicture"
    );

    if (!posts.length) {
      return res.status(200).json({
        success: true,
        message: "The user hasn't posted anything yet.",
      });
    }

    return res.status(200).json({
      success: true,
      posts,
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
      coverImage: 1,
      isPrivate: 1,
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

export const updateAccountPrivacy = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { privacy } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!privacy || (privacy !== "private" && privacy !== "public")) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid privacy setting. It should be either 'private' or 'public'.",
      });
    }

    if (privacy === "private") {
      await User.findByIdAndUpdate(userId, {
        $set: { isPrivate: true },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { isPrivate: false },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Account privacy set to ${privacy} successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const updateActiveStatusVisibility = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { showActiveStatus } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (showActiveStatus) {
      await User.findByIdAndUpdate(userId, {
        $set: { showActiveStatus: true },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { showActiveStatus: false, isActive: false },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active status visibility updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const toggleMentionsAllowance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { allowMentions } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (allowMentions) {
      await User.findByIdAndUpdate(userId, {
        $set: { allowMentions: true },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { allowMentions: false },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentions allowance updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getUsersForMention = async (
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
      .populate(
        "following",
        "_id firstName lastName username profilePicture allowMentions"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const usersAllowingMentions = user.following.filter(
      (followedUser) => followedUser.allowMentions
    );

    return res.status(200).json({
      success: true,
      users: usersAllowingMentions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const unfollow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const followingId: string = req.params.followingId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!followingId)
      return res.status(400).json({
        success: false,
        message: "Following user's id is required.",
      });

    const following = await User.findById(followingId);
    if (!following) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.following.includes(followingId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user.",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { following: followingId },
    });

    await User.findByIdAndUpdate(followingId, {
      $pull: { followers: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully unfollowed.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const blockUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const id: string = req.params.id;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!id)
      return res.status(400).json({
        success: false,
        message: "User id is required.",
      });

    const userToBeBlocked = await User.findById(id);
    if (!userToBeBlocked) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = await User.findById(userId);
    if (user.blockedUsers.includes(id)) {
      return res.status(200).json({
        success: true,
        message: "User blocked successfully.",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { blockedUsers: id },
      $pull: { followers: id, following: id },
    });

    await User.findByIdAndUpdate(id, {
      $pull: { followers: userId, following: userId },
    });

    const chat = await Chat.findOneAndDelete({
      members: { $all: [id, userId], $size: 2 },
    });

    if (chat) {
      await Message.deleteMany({ chatId: chat._id });
    }

    return res.status(200).json({
      success: true,
      message: "User blocked successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const unblockUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const id: string = req.params.id;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!id)
      return res.status(400).json({
        success: false,
        message: "User id is required.",
      });

    const userToBeUnBlocked = await User.findById(id);
    if (!userToBeUnBlocked) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = await User.findById(userId);
    if (!user.blockedUsers.includes(id)) {
      return res.status(200).json({
        success: true,
        message: "This user is not in your blocked list.",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: id },
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getBlockedUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    const user: User | null = await User.findById(userId)
      .select({
        blockedUsers: 1,
        _id: 0,
      })
      .populate(
        "blockedUsers",
        "_id firstName lastName username email profilePicture coverImage"
      );

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    const blockedUsers = user.blockedUsers || [];

    return res.status(200).json({
      success: true,
      blockedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
