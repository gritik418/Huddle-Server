import fs from "fs";
import multer from "multer";
import path, { dirname, extname } from "path";
import { fileURLToPath } from "url";
import {
  imageFileFilter,
  postMediaFileFilter,
} from "../helpers/fileFilters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const userStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const userId = req.params.userId;
    let destinationPath;

    if (file.fieldname === "profilePicture") {
      destinationPath = path.join(
        __dirname,
        "../../public/uploads/",
        userId,
        "/profilePicture"
      );
    } else {
      destinationPath = path.join(
        __dirname,
        "../../public/uploads/",
        userId,
        "/coverImage"
      );
    }

    try {
      await fs.promises.rm(destinationPath, { recursive: true, force: true });
      await fs.promises.mkdir(destinationPath, { recursive: true });

      cb(null, destinationPath);
    } catch (err) {
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

    const destinationPath = path.join(
      __dirname,
      "../../public/uploads/",
      userId,
      "/posts"
    );

    fs.mkdirSync(destinationPath, { recursive: true });

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const extName = extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${extName}`;

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
