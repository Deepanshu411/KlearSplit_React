import { useEffect } from "react";
import { getBalanceAsNumber } from "../utils/getBalanceAsNumber.ts"; // Utility function for balance conversion
import isFriendsConversations from "../utils/isFriendsConversations.ts";
import { IconButton, Tooltip } from "@mui/material";
import { Check, Close } from "@mui/icons-material";

interface ChatListProps {
  chats: FriendData[] | GroupData[];
  handleSelectChat: (friend: FriendData | GroupData) => void;
  handleAcceptReject: (
    chat: FriendData | GroupData,
    status: "ACCEPTED" | "REJECTED"
  ) => Promise<void>;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  handleSelectChat,
  handleAcceptReject,
}) => {
  useEffect(() => {
    const chatList = document.querySelector(".chat-list");
    if (chatList) {
      chatList.scrollTop = chatList.scrollHeight;
    }
  }, [chats]);
  return (
    <div className="flex flex-col justify-start items-center w-full min-h-[60vh] max-h-[60vh] overflow-y-auto">
      {isFriendsConversations(chats)
        ? chats.map((friend, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-between w-full p-4 cursor-pointer active:cursor-grabbing"
            >
              <div
                className="flex flex-row items-center gap-4 w-full"
                onClick={() => handleSelectChat(friend)}
              >
                <img
                  src={friend.friend.image_url || "/profile.png"}
                  alt={friend.friend.first_name}
                  className="h-6 w-6 xl:h-10 xl:w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <h5 className="xl:text-md text-sm font-semibold">
                    {friend.friend.first_name} {friend.friend.last_name}
                  </h5>
                  <p className="text-xs xl:text-sm">{friend.friend.email}</p>
                </div>
              </div>
              <h6
                className={`text-sm xl:text-md ${
                  getBalanceAsNumber(friend.balance_amount) < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                ₹{Math.abs(parseFloat(friend.balance_amount)).toFixed(2)}
                {friend.isRequest}
              </h6>
              {friend.isRequest && friend.status === "RECEIVER" && (
                <div className="flex flex-row items-center gap-2">
                  <Tooltip title="Accept Request" placement="top">
                    <IconButton
                      color="success"
                      onClick={() =>
                        handleAcceptReject(friend, "ACCEPTED")
                      }
                    >
                      <Check />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Request" placement="top">
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleAcceptReject(friend, "REJECTED")
                      }
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          ))
        : chats.map((group, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-between w-full p-4 cursor-pointer active:cursor-grabbing"
            >
              <div
                className="flex flex-row items-center gap-4 w-full"
                onClick={() => handleSelectChat(group)}
              >
                <img
                  src={group.image_url || "/groupProfile.png"}
                  alt={group.group_name}
                  className="h-6 w-6 xl:h-10 xl:w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <h5 className="xl:text-md text-sm font-semibold">
                    {group.group_name}
                  </h5>
                </div>
              </div>
              <h6
                className={`text-sm xl:text-md ${
                  getBalanceAsNumber(group.balance_amount) < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                ₹{Math.abs(parseFloat(group.balance_amount)).toFixed(2)}
              </h6>
              {group.status === "PENDING" && (
                <div className="flex flex-row items-center gap-2">
                  <Tooltip title="Accept Invite" placement="top">
                    <IconButton color="success" onClick={() => handleAcceptReject(group, "ACCEPTED")}>
                      <Check />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Invite" placement="top">
                    <IconButton color="error" onClick={() => handleAcceptReject(group, "REJECTED")}>
                      <Close />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          ))}
    </div>
  );
};

export default ChatList;
