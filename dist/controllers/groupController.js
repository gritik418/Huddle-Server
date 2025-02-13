import groupSchema from "../validators/groupSchema.js";
import Chat from "../models/Chat.js";
import { ConnectedUsers } from "../socket/socketServer.js";
import { ADDED_TO_GROUP } from "../constants/events.js";
import User from "../models/User.js";
export const getGroupById = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const group = await Chat.findById(groupId)
            .populate("members", "_id firstName lastName username profilePicture")
            .populate("admins", "_id firstName lastName username profilePicture");
        if (!group)
            return res.status(400).json({
                success: false,
                message: "Group doesn't exists.",
            });
        return res.status(200).json({
            success: true,
            group,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const createGroup = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.params.userId;
        const result = groupSchema.safeParse(data);
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
        const { groupName, groupDescription, admins, members } = result.data;
        const newGroup = new Chat({
            isGroupChat: true,
            groupName,
            groupDescription,
            members: [...members, userId],
            admins: [...admins, userId],
        });
        const savedGroup = await newGroup.save();
        const user = await User.findById(userId);
        members.forEach((member) => {
            const receiverSocket = ConnectedUsers.get(member);
            if (receiverSocket && receiverSocket?.id) {
                receiverSocket.emit(ADDED_TO_GROUP, {
                    chat: savedGroup,
                    creator: {
                        _id: user?._id,
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        username: user?.username,
                        profilePicture: user?.profilePicture,
                    },
                });
            }
        });
        return res.status(200).json({
            success: true,
            message: "Group created.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
