import fs from "fs";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const userId = req.params.userId;
        let destinationPath;
        if (file.fieldname === "avatar") {
            destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/avatar");
        }
        else {
            destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/coverImage");
        }
        try {
            await fs.promises.rm(destinationPath, { recursive: true, force: true });
            await fs.promises.mkdir(destinationPath, { recursive: true });
            cb(null, destinationPath);
        }
        catch (err) {
            cb(new Error("Error while handling the file upload directory."), "");
        }
    },
    filename: function (req, file, cb) {
        const filename = file.originalname;
        cb(null, filename);
    },
});
export const uploadUserAvatarOrCoverImage = multer({
    storage: userStorage,
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]);
