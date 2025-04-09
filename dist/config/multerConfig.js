import fs from "fs";
import multer from "multer";
import path, { dirname, extname } from "path";
import { fileURLToPath } from "url";
import { imageFileFilter, postMediaFileFilter, } from "../helpers/fileFilters.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.userId;
        let destinationPath;
        if (file.fieldname === "profilePicture") {
            destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/profilePicture");
        }
        else {
            destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/coverImage");
        }
        fs.promises
            .rm(destinationPath, { recursive: true, force: true })
            .then(() => fs.promises.mkdir(destinationPath, { recursive: true }))
            .then(() => cb(null, destinationPath))
            .catch(() => cb(new Error("Error while handling the file upload directory."), ""));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const groupIconStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.userId;
        const destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/group", "/icons");
        fs.promises
            .rm(destinationPath, { recursive: true, force: true })
            .then(() => fs.promises.mkdir(destinationPath, { recursive: true }))
            .then(() => cb(null, destinationPath))
            .catch(() => cb(new Error("Error while handling the file upload directory."), ""));
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
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
const storyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.userId;
        const destinationPath = path.join(__dirname, "../../public/uploads/", userId, "/story");
        fs.promises
            .mkdir(destinationPath, { recursive: true })
            .then(() => cb(null, destinationPath))
            .catch(() => cb(new Error("Error while handling the file upload directory."), ""));
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
});
export const uploadPostMedia = multer({
    storage: postMediaStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },
    fileFilter: postMediaFileFilter,
}).array("media");
export const uploadGroupIcon = multer({
    storage: groupIconStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: postMediaFileFilter,
}).single("groupIcon");
export const uploadUserAvatarOrCoverImage = multer({
    storage: userStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: imageFileFilter,
}).fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]);
export const uploadStory = multer({
    storage: storyStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
    fileFilter: postMediaFileFilter,
}).single("storyMedia");
