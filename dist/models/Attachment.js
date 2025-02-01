import { Schema } from "mongoose";
const AttachmentSchema = new Schema({
    filename: { type: String },
    fileType: { type: String },
    filePath: { type: String },
    size: { type: Number },
});
export default AttachmentSchema;
