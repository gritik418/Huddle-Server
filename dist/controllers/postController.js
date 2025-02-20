import multer from "multer";
import Post from "../models/Post.js";
import postSchema from "../validators/postSchema.js";
export const addPost = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const mediaUrls = [];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const result = postSchema.safeParse(data);
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
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
                const filePath = `${process.env.BASE_URL}/uploads/${userId}/posts/${file.filename}`;
                mediaUrls.push(filePath);
            });
        }
        const post = new Post({
            userId,
            mediaUrls,
            hashtags: result.data.hashtags,
            mentions: result.data.mentions,
            location: result.data.location,
            content: result.data.content,
        });
        await post.save();
        return res.status(201).json({
            success: true,
            message: "Post added.",
        });
    }
    catch (error) {
        if (error instanceof multer.MulterError) {
            switch (error.code) {
                case "LIMIT_FILE_SIZE":
                    return res.status(400).json({
                        success: false,
                        message: "File size is too large.",
                    });
                case "LIMIT_FILE_COUNT":
                    return res.status(400).json({
                        success: false,
                        message: "Too many files uploaded.",
                    });
                case "LIMIT_UNEXPECTED_FILE":
                    return res.status(400).json({
                        success: false,
                        message: "Unexpected file field.",
                    });
                default:
                    return res.status(400).json({
                        success: false,
                        message: "An error occurred during the file upload.",
                    });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
