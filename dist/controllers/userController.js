import User from "../models/User.js";
import updateUserSchema from "../validators/updateUserSchema.js";
import Post from "../models/Post.js";
export const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId).select({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getPostsByUser = async (req, res) => {
    try {
        const id = req.params.id;
        const posts = await Post.find({ userId: id }).populate("userId", "_id firstName lastName username coverImage profilePicture");
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getUserByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId)
            .select({
            following: 1,
            _id: 1,
        })
            .populate("following", "_id firstName lastName username profilePicture");
        return res.status(200).json({
            success: true,
            following: user?.following || [],
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId)
            .select({
            followers: 1,
            _id: 1,
        })
            .populate("followers", "_id firstName lastName username profilePicture");
        return res.status(200).json({
            success: true,
            followers: user?.followers || [],
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getActiveMembers = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId)
            .select({
            chatMembers: 1,
            _id: 0,
        })
            .populate("chatMembers", "_id isActive");
        const activeMembers = [];
        user?.chatMembers?.forEach((member) => {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const result = updateUserSchema.safeParse(data);
        if (!result.success) {
            const errors = {};
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
        const updateData = {};
        if (firstName)
            updateData.firstName = firstName;
        if (lastName)
            updateData.lastName = lastName;
        if (bio)
            updateData.bio = bio;
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
        if (req.files &&
            !Array.isArray(req.files) &&
            typeof req.files === "object") {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const updateAccountPrivacy = async (req, res) => {
    try {
        const userId = req.params.userId;
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
                message: "Invalid privacy setting. It should be either 'private' or 'public'.",
            });
        }
        if (privacy === "private") {
            await User.findByIdAndUpdate(userId, {
                $set: { isPrivate: true },
            });
        }
        else {
            await User.findByIdAndUpdate(userId, {
                $set: { isPrivate: false },
            });
        }
        return res.status(200).json({
            success: true,
            message: `Account privacy set to ${privacy} successfully.`,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const updateActiveStatusVisibility = async (req, res) => {
    try {
        const userId = req.params.userId;
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
        }
        else {
            await User.findByIdAndUpdate(userId, {
                $set: { showActiveStatus: false, isActive: false },
            });
        }
        return res.status(200).json({
            success: true,
            message: "Active status visibility updated successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const toggleMentionsAllowance = async (req, res) => {
    try {
        const userId = req.params.userId;
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
        }
        else {
            await User.findByIdAndUpdate(userId, {
                $set: { allowMentions: false },
            });
        }
        return res.status(200).json({
            success: true,
            message: "Mentions allowance updated successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getUsersForMention = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId)
            .select({
            following: 1,
            _id: 1,
        })
            .populate("following", "_id firstName lastName username profilePicture allowMentions");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        const usersAllowingMentions = user.following.filter((followedUser) => followedUser.allowMentions);
        return res.status(200).json({
            success: true,
            users: usersAllowingMentions,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const unfollow = async (req, res) => {
    try {
        const userId = req.params.userId;
        const followingId = req.params.followingId;
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
