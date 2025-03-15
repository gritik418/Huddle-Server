import { Request, Response } from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";

export const search = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    const searchQuery: string = req.query["q"]?.toString() || "";
    const type: string = req.query["type"]?.toString() || "accounts";

    switch (type) {
      case "accounts":
        const totalUsers = await User.countDocuments({
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
        });

        const totalPages = Math.ceil(totalUsers / +limit);

        const users: User[] = await User.find({
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
        })
          .select("_id firstName lastName username profilePicture")
          .skip((+page - 1) * +limit)
          .limit(+limit)
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          users,
          pagination: {
            page: +page,
            limit: +limit,
            totalPages,
          },
        });

      case "hashtags":
        if (searchQuery) {
          const totalPosts = await Post.countDocuments({
            $or: [
              { isPrivate: false },
              { followers: { $in: [userId] } },
              { userId: { $eq: userId } },
            ],
            hashtags: { $in: [`#${searchQuery}`] },
          });

          const totalPostPages = Math.ceil(totalPosts / +limit);

          const posts = await Post.find({
            $or: [
              { isPrivate: false },
              { followers: { $in: [userId] } },
              { userId: { $eq: userId } },
            ],
            hashtags: { $in: [`#${searchQuery}`] },
          })
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 })
            .populate(
              "userId",
              "_id firstName lastName username coverImage profilePicture"
            );

          return res.status(200).json({
            success: true,
            posts,
            pagination: {
              page: +page,
              limit: +limit,
              totalPages: totalPostPages,
            },
          });
        } else {
          const totalPosts = await Post.countDocuments({
            $or: [
              { isPrivate: false },
              { followers: { $in: [userId] } },
              { userId: { $eq: userId } },
            ],
          });

          const totalPostPages = Math.ceil(totalPosts / +limit);

          const posts = await Post.find({
            $or: [
              { isPrivate: false },
              { followers: { $in: [userId] } },
              { userId: { $eq: userId } },
            ],
          })
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 })
            .populate(
              "userId",
              "_id firstName lastName username coverImage profilePicture"
            );

          return res.status(200).json({
            success: true,
            posts,
            pagination: {
              page: +page,
              limit: +limit,
              totalPages: totalPostPages,
            },
          });
        }
    }

    return res.status(400).json({
      success: false,
      message: "Please choose a valid type.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
