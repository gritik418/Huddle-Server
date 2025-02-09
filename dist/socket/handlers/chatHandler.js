import { NEW_CHAT_REQUEST } from "../../constants/events.js";
import { ConnectedUsers } from "../socketServer.js";
export const newChatRequestHandler = (socket, chatRequest) => {
    const receiver = ConnectedUsers.get(chatRequest.receiver.toString());
    if (receiver) {
        socket.to(receiver).emit(NEW_CHAT_REQUEST, { chatRequest });
    }
};
