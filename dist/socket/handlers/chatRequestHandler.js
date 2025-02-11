import { NEW_CHAT_REQUEST } from "../../constants/events.js";
import { ConnectedUsers } from "../socketServer.js";
export const newChatRequestHandler = (io, socket, chatRequest) => {
    const receiver = ConnectedUsers.get(chatRequest.receiver.toString());
    if (receiver) {
        const modifiedChatRequest = {
            receiver: chatRequest.receiver,
            status: chatRequest.status,
            _id: chatRequest._id,
            sender: {
                _id: socket.user.id,
                firstName: socket.user.firstName,
                lastName: socket.user.lastName,
                username: socket.user.username,
                profilePicture: socket.user.profilePicture,
            },
        };
        io.to(receiver.id).emit(NEW_CHAT_REQUEST, {
            chatRequest: modifiedChatRequest,
        });
    }
};
