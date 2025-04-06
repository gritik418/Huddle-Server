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

interface Pulse {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
}

interface JWT_Payload {
  id: string;
  email: string;
}

interface Channel {
  _id: Types.ObjectId;
  name: string;
  description: string;
  type: "public" | "private" | "invite-only";
  creatorId: Types.ObjectId;
  members: Types.ObjectId[];
  isActive: boolean;
  sendMessagePermission: "creator" | "members" | "everyone";
}

interface JoinRequest {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  channelId: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

interface ChannelMessage {
  channelId: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  attachment?: Attachment[];
  sentAt?: Date;
  status: "sent" | "delivered" | "failed";
  deletedFor: Types.ObjectId[];
}

interface ChannelMember {
  _id: string;
  firstName: string;
  lastName?: string;
  username: string;
  profilePicture?: string;
  coverImage?: string;
}

interface Story {
  _id: string;
  userId: Follower;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  caption?: string;
  createdAt: string;
  expiresAt: string;
  viewsCount?: number;
  viewers?: string[];
}
