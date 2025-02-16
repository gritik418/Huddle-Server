import User from "../models/User.js";
export const search = async (req, res) => {
    try {
        const userId = req.params.userId;
        const searchQuery = req.query["q"]?.toString() || "";
        const type = req.query["type"]?.toString() || "accounts";
        switch (type) {
            case "accounts":
                const users = await User.find({
                    $or: [
                        {
                            firstName: { $regex: searchQuery, $options: "i" },
                        },
                        {
                            lastName: { $regex: searchQuery, $options: "i" },
                        },
                        {
                            username: { $regex: searchQuery, $options: "i" },
                        },
                    ],
                    _id: { $ne: userId },
                    isVerified: true,
                }).select("_id firstName lastName username profilePicture");
                return res.status(200).json({
                    success: true,
                    users,
                });
            case "channels":
                const channels = [];
                return res.status(200).json({
                    success: true,
                    channels,
                });
        }
        return res.status(400).json({
            success: false,
            message: "Please choose a valid type.",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
