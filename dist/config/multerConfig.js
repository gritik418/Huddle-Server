import fs from "fs";
import multer from "multer";
import path, { dirname, extname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const userId = req.params.userId;
        let destinationPath;
        if (file.fieldname === "profilePicture") {
            destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/profilePicture");
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
const postMediaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.userId;
        const destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/posts");
        fs.mkdirSync(destinationPath, { recursive: true });
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const extName = extname(file.originalname);
        const filename = `${Date.now()}-${file.fieldname}${extName}`;
        cb(null, filename);
    },
});
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type."), false);
    }
};
export const uploadPostMedia = multer({
    storage: postMediaStorage,
}).array("media");
export const uploadUserAvatarOrCoverImage = multer({
    storage: userStorage,
    fileFilter: imageFileFilter,
}).fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]);
