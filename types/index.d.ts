interface User {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  password?: string;
  profilePicture?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  provider: "credentials" | "google";
  chatMembers?: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  followRequests: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  posts: Types.ObjectId[];
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
}

interface Chat {
  _id: string;
  isGroupChat: boolean;
  groupName?: string;
  groupDescription?: string;
  groupIcon?: string;
  members: Types.ObjectId[];
  admins?: Types.ObjectId[];
  lastMessage?: string;
  groupStatus?: "active" | "deleted";
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deletedFor: Types.ObjectId[];
}

interface Message {
  _id: string;
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  attachment?: Attachment[];
  sentAt?: Date;
  readAt?: Date;
  status: "sent" | "delivered" | "read" | "failed";
}

interface ChatRequest {
  _id: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

interface FollowRequest {
  _id: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

interface Attachment {
  filename: string;
  fileType?: string;
  filePath: string;
  size: number;
}

interface JWT_Payload {
  id: string;
  email: string;
}
