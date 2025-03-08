import groupSchema from "../validators/groupSchema.js";
import Chat from "../models/Chat.js";
import { ConnectedUsers } from "../socket/socketServer.js";
import { ADDED_TO_GROUP } from "../constants/events.js";
import User from "../models/User.js";
export const getGroupById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        const group = await Chat.findById(groupId).populate("members", "_id firstName lastName username profilePicture");
        if (!group)
            return res.status(400).json({
                success: false,
                message: "Group doesn't exists.",
            });
        const hasUserDeleted = group.deletedFor.some((id) => id.toString() === userId);
        if (hasUserDeleted) {
            return res.status(400).json({
                success: false,
                message: "You have already deleted or left the group.",
            });
        }
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
        const { groupName, groupDescription, admins = [], members } = result.data;
        let groupIcon = null;
        if (req.file) {
            groupIcon = `${process.env.BASE_URL}/uploads/${userId}/group/icons/${req.file.filename}`;
        }
        const newGroup = new Chat({
            isGroupChat: true,
            groupName,
            groupIcon,
            groupDescription,
            members: [...members, userId],
            admins: [...admins, userId],
            groupStatus: "active",
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
export const deleteGroup = async (req, res) => {
    try {
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        const group = await Chat.findById(groupId);
        if (!group)
            return res.status(400).json({
                success: false,
                message: "Group doesn't exists.",
            });
        const isAdmin = group.admins?.find((admin) => admin.toString() === userId);
        if (!isAdmin)
            return res.status(401).json({
                success: false,
                message: "Only Group Admin can delete the group.",
            });
        if (group.groupStatus === "deleted") {
            return res.status(400).json({
                success: false,
                message: "Group has already been deleted.",
            });
        }
        await Chat.findByIdAndUpdate(groupId, {
            $set: {
                deletedAt: Date.now(),
                deletedBy: userId,
                groupStatus: "deleted",
            },
            $push: { deletedFor: userId },
        });
        return res.status(200).json({
            success: true,
            message: "Group deleted successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const leaveGroup = async (req, res) => {
    try {
        const userId = req.params.userId;
        const groupId = req.params.groupId;
        const group = await Chat.findById(groupId);
        if (!group)
            return res.status(400).json({
                success: false,
                message: "Group doesn't exists.",
            });
        const isMember = group.members.some((member) => member.toString() === userId);
        if (!isMember) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of the group.",
            });
        }
        const isAdmin = group.admins?.some((admin) => admin.toString() === userId);
        const isLastAdmin = group.admins?.length === 1 && isAdmin;
        if (isLastAdmin) {
            const remainingMembers = group.members.filter((member) => member.toString() !== userId);
            if (remainingMembers.length > 0) {
                const newAdmin = remainingMembers[0];
                await Chat.findByIdAndUpdate(groupId, {
                    $set: { admins: [newAdmin] },
                    $pull: { members: userId, admins: userId },
                    $push: { deletedFor: userId },
                });
                return res.status(200).json({
                    success: true,
                    message: "You have successfully left the group.",
                });
            }
            else {
                await Chat.findByIdAndDelete(groupId);
                return res.status(200).json({
                    success: true,
                    message: "You have successfully left the group.",
                });
            }
        }
        if (isAdmin) {
            await Chat.findByIdAndUpdate(groupId, {
                $pull: { members: userId, admins: userId },
            });
        }
        else {
            await Chat.findByIdAndUpdate(groupId, {
                $pull: { members: userId },
            });
        }
        if (group.members.length === 1) {
            await Chat.findByIdAndDelete(groupId);
        }
        else {
            await Chat.findByIdAndUpdate(groupId, {
                $push: { deletedFor: userId },
            });
        }
        return res.status(200).json({
            success: true,
            message: "You have successfully left the group.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
