import mongoose, { Model, Schema } from "mongoose";

const NotificationSettingsSchema = new Schema<NotificationSettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  allowChatRequestNotification: { type: Boolean, default: true },
  allowNewMessageNotification: { type: Boolean, default: true },
  allowNewGroupNotification: { type: Boolean, default: true },
  allowFollowRequestNotification: { type: Boolean, default: true },
  allowAddedToGroupNotification: { type: Boolean, default: true },
  allowNewMentionNotification: { type: Boolean, default: true },
  allowNewChannelMessageNotification: { type: Boolean, default: true },
  allowAcceptedFollowRequestNotification: { type: Boolean, default: true },
});

const NotificationSettings: Model<NotificationSettings> =
  mongoose.models.NotificationSettings ||
  mongoose.model("NotificationSettings", NotificationSettingsSchema);

export default NotificationSettings;
