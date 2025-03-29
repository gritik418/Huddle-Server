import ChannelSchema from "../validators/channelSchema.js";
import Channel from "../models/Channel.js";
export const getAllChannels = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const channels = await Channel.find();
        return res.status(200).json({
            success: true,
            channels,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const createChannel = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const data = req.body;
        const result = ChannelSchema.safeParse(data);
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
        const { name, description, sendMessagePermission, type } = result.data;
        const existingChannel = await Channel.findOne({ name, creatorId: userId });
        if (existingChannel) {
            return res.status(400).json({
                success: false,
                message: `A channel named "${name}" already exists. Please choose another name.`,
            });
        }
        const channel = new Channel({
            name,
            description,
            sendMessagePermission,
            type,
            members: [userId],
            creatorId: userId,
            isActive: true,
        });
        const savedChannel = await channel.save();
        return res.status(201).json({
            success: true,
            message: "Channel has been successfully created.",
            channel: savedChannel,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getUserChannels = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const channels = await Channel.find({ creatorId: userId });
        return res.status(200).json({
            success: true,
            channels,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
