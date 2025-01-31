interface User {
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
  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  posts: Types.ObjectId[];
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
}

interface Chat {
  isGroupChat: boolean;
  groupName?: string;
  groupIcon?: string;
  members: Types.ObjectId[];
  admins?: Types.ObjectId[];
  lastMessage?: string;
}
