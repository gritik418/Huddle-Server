import { Server, Socket } from "socket.io";
export declare const sendMessageHandler: (io: Server, socket: Socket, message: Message, chat: Chat) => Promise<void>;
