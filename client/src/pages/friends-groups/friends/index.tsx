import { useEffect, useState } from "react";
import { getFriends } from "./services";
import { toast } from "sonner";
import SearchBar from "../components/SearchBar";
import SwitchList from "../components/SwitchList";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { Typography } from "@mui/material";
import { useSocket } from "../hooks/useSocket";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
const FriendsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [currentView, setCurrentView] = useState<
    "All" | "Expenses" | "Messages"
  >("All");
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [requests, setRequests] = useState<FriendData[]>([]);
  const [friendsList, setFriendsList] = useState<FriendData[]>([]);
  const [selected, setSelected] = useState("Friends");
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [blockStatus, setBlockStatus] = useState<"BLOCK" | "UNBLOCK">("BLOCK");
  const [archiveStatus, setArchiveStatus] = useState<"ARCHIVE" | "UNARCHIVE">(
    "ARCHIVE"
  );
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [combinedView, setCombinedView] = useState<
    (
      | CombinedMessage
      | CombinedExpense
      | CombinedGroupMessage
      | CombinedGroupExpense
      | CombinedGroupSettlement
    )[]
  >([]);
  const [message, setMessage] = useState("");

  const {
    onNewConversationMessage,
    removeNewMessageListener,
    sendConversationMessage,
    leaveRoom,
  } = useSocket();

  const onSendFriendMessage = async (message: string) => {
    const messageData = {
      conversation_id: selectedFriend?.conversation_id,
      sender_id: user?.user_id,
      message,
    };
    sendConversationMessage(messageData);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return; // Prevent sending empty message
    onSendFriendMessage(message);
    setMessage("");
  };

  useEffect(() => {
    const handleNewMessage = (message: MessageData) => {
      const messageWithTime = {
        ...message,
        createdAt: new Date().toISOString(),
      };
      setMessages && setMessages((prevMessages) => [...prevMessages, messageWithTime]);
      setCombinedView((prev) => [...prev, { ...messageWithTime, type: "message" }]);
    };

    // Listen for new conversation messages
    onNewConversationMessage(handleNewMessage);

    // Cleanup the listener when the component unmounts or when switching rooms
    return () => {
      removeNewMessageListener();
    };
  }, [onNewConversationMessage, removeNewMessageListener]);

  useEffect(() => {
    setFriendsList(friends);
    setFilteredFriends(friends);
  }, [friends]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredFriends(friendsList); // Reset if query is empty
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    switch (selected) {
      case "Friends":
        setFilteredFriends(
          friendsList.filter(
            (friend) =>
              friend.friend.first_name
                .toLowerCase()
                .includes(lowercasedQuery) ||
              friend.friend.email.toLowerCase().includes(lowercasedQuery)
          )
        );
        break;
      case "Requests":
        setFilteredFriends(
          requests.filter(
            (request) =>
              request.friend.first_name
                .toLowerCase()
                .includes(lowercasedQuery) ||
              request.friend.email.toLowerCase().includes(lowercasedQuery)
          )
        );
        break;
      default:
        break;
    }
  };

  const handleListChange = () => {
    switch (selected) {
      case "Friends":
        setFilteredFriends(friends);
        break;
      case "Requests":
        setFilteredFriends(requests);
        break;
      default:
        break;
    }
  };

  const clearSelectedFriend = () => {
    leaveRoom(selectedFriend?.conversation_id!);
    setSelectedFriend(null);
    setMessages([]);
    setExpenses([]);
    setCombinedView([]);
  };

  useEffect(() => {
    handleListChange();
  }, [selected]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendsList = await getFriends({ status: "ACCEPTED" });
        const requestsList = await getFriends({ status: "PENDING" });
        setFriends(friendsList);
        setRequests(requestsList);
      } catch (error) {
        toast.error("Failed to fetch friends");
      }
    };
    fetchFriends();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Left Panel */}
      <div
        className={`bg-white h-full lg:flex lg:flex-col items-center col-span-1 p-4 rounded-lg space-y-6 ${
          selectedFriend ? "hidden" : "flex flex-col"
        }`}
      >
        <SearchBar
          onSearch={handleSearch}
          chats={filteredFriends}
          setChats={(newChats) => setFriends(newChats as FriendData[])}
        />
        <SwitchList
          title="Friends"
          selected={selected}
          setSelected={setSelected}
          requestsLength={requests.length}
        />
        <ChatList
          chats={filteredFriends}
          onSelectConversation={(friend) =>
            setSelectedFriend(friend as FriendData)
          }
        />
      </div>

      {/* Right Panel */}
      {selectedFriend ? (
        <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
          <ChatHeader
            currentView={currentView}
            setCurrentView={setCurrentView}
            chat={selectedFriend}
            setChats={(friends) => setFriends(friends as FriendData[])}
            clearSelectedChat={clearSelectedFriend}
            blockStatus={blockStatus}
            setBlockStatus={setBlockStatus}
            archiveStatus={archiveStatus}
            setArchiveStatus={setArchiveStatus}
            setExpenses={setExpenses}
            setCombinedView={setCombinedView}
          />
          <hr className="border-t-4 border-gray-400" />
          <ChatWindow
            currentView={currentView}
            chat={selectedFriend}
            messages={messages}
            expenses={expenses}
            combinedView={combinedView}
            setMessages={setMessages}
            setExpenses={setExpenses}
            setCombinedView={setCombinedView}
          />
          <hr className="border-t-4 border-gray-400" />
          <MessageInput
            chat={selectedFriend}
            handleSendMessage={handleSendMessage}
            message={message}
            setMessage={setMessage}
            setChats={(chats) => setFriends(chats as FriendData[])}
            blockStatus={blockStatus}
            setExpenses={setExpenses}
            setCombinedView={setCombinedView}
          />
        </div>
      ) : (
        <div className="bg-white h-full hidden lg:flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg items-center justify-center">
          <Typography className="text-blue-500" fontSize={35}>
            Please select a chat to start!
          </Typography>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
