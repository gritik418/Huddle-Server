import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: {
      id: string;
      firstName: string;
      lastName?: string;
      username: string;
      profilePicture?: string;
      chatMembers?: string[];
    };
  }
}
