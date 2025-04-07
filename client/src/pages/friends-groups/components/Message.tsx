import React from "react";
import formatTime from "../../../utils/formatTime";

interface MessageItemProp {
    message: {
        message: string;
        createdAt: string;
        updatedAt: string;
    };
    isCurrentUser: boolean;
    name: string;
    imageUrl: string;
    currentUserImageUrl: string
}

const MessageItem: React.FC<MessageItemProp> = ({ message, isCurrentUser, name, imageUrl, currentUserImageUrl }) => {
    return (
        <li className={`flex mb-1 px-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            {/* Avatar for Other Users */}
            {!isCurrentUser && (
                <img
                    src={imageUrl || "/static/images/avatar/1.jpg"}
                    alt="avatar"
                    className="rounded-full inline-flex self-end mr-3 shadow-md"
                    width="32"
                />
            )}

            {/* Message Bubble */}
            <div
                className="max-w-[45vw] rounded-2xl border-2 border-white/5 backdrop-blur-lg bg-black/20 shadow-lg text-sm p-1"
            >
                {/* Header */}
                <div
                    className={`flex px-4 ${isCurrentUser ? "justify-end" : "justify-start"} border-b border-white/30 bg-transparent`}
                >
                    <p className="font-bold mb-0">{isCurrentUser ? "You" : name}</p>
                </div>

                {/* Message Content */}
                <div className="px-3 py-1 w-full break-words">
                    {isCurrentUser}
                    <p className="mb-0 w-full">{message.message}</p>

                    {/* Timestamp */}
                    <div className="flex justify-end items-center text-xs text-black/70">
                        <span>{formatTime(message.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Avatar for Current User */}
            {isCurrentUser && (
                <img
                    src={currentUserImageUrl || "/static/images/avatar/1.jpg"}
                    alt="avatar"
                    className="rounded-full inline-flex self-end ml-3 shadow-md"
                    width="32"
                />
            )}
        </li>
    );
};

export default MessageItem;