import Pulse from "../models/Pulse.js";
export const getAllPulses = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 20 } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const totalPulses = await Pulse.countDocuments();
        const totalPages = Math.ceil(totalPulses / +limit);
        const pulses = await Pulse.find()
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            pulses,
            pagination: {
                page: +page,
                limit: +limit,
                totalPages,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getUserPulses = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 20 } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const totalPulses = await Pulse.countDocuments({ userId });
        const totalPages = Math.ceil(totalPulses / +limit);
        const pulses = await Pulse.find({ userId })
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            pulses,
            pagination: {
                page: +page,
                limit: +limit,
                totalPages,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const addPulse = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { content } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        if (!content)
            return res.status(400).json({
                success: false,
                message: "Please provide the content for your Pulse.",
            });
        const pulse = new Pulse({
            userId,
            content,
        });
        await pulse.save();
        return res.status(201).json({
            success: true,
            message: "Your Pulse has been posted successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const deletePulse = async (req, res) => {
    try {
        const userId = req.params.userId;
        const pulseId = req.params.pulseId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        if (!pulseId) {
            return res.status(400).json({
                success: false,
                message: "Pulse Id is required.",
            });
        }
        await Pulse.findByIdAndDelete(pulseId);
        return res.status(200).json({
            success: true,
            message: "Pulse deleted.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
