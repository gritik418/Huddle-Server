interface User {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  password?: string;
  coverImage?: string;
  profilePicture?: string;
  bio?: string;
  showActiveStatus: boolean;
  allowMentions: boolean;
  isVerified: boolean;
  isActive: boolean;
  isPrivate: boolean;
  provider: "credentials" | "google";
  chatMembers?: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  posts: Types.ObjectId[];
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
}

interface Post {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  mediaUrls?: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  location?: string;
  mentions?: Types.ObjectId[];
  hashtags?: string[];
}

interface Comment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  replies: Types.ObjectId[];
  mentions?: Types.ObjectId[];
}

interface CommentReply {
  _id: Types.ObjectId;
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  mentions?: Types.ObjectId[];
}

interface Chat {
  _id: string;
  isGroupChat: boolean;
  groupName?: string;
  groupDescription?: string;
  groupIcon?: string;
  members: Types.ObjectId[];
  admins?: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
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
  deletedFor: Types.ObjectId[];
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
