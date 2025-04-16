import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchGroupMembers, getGroups, saveGroupMessages } from "./services";
import SearchBar from "../components/SearchBar";
import SwitchList from "../components/SwitchList";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useLocation } from "react-router-dom";
import GroupDetailPage from "./GroupDetails";
import { useSocket } from "../hooks/useSocket";
import getFullNameAndImage from "../utils/getFullNameAndImage";

const GroupsPage = () => {
  const location = useLocation();
  const isDetailsPage = location.pathname.endsWith("/details");
  const user = useSelector((store: RootState) => store.auth.user);
  const [currentView, setCurrentView] = useState<
    "All" | "Expenses" | "Messages"
  >("All");
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [requests, setRequests] = useState<GroupData[]>([]);
  const [groupList, setGroupList] = useState<GroupData[]>([]);
  const [selected, setSelected] = useState("Groups");
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMemberData[]>([]);
  const [currentMember, setCurrentMember] = useState<GroupMemberData>();
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [blockStatus, setBlockStatus] = useState<boolean>(false);
  const [archiveStatus, setArchiveStatus] = useState<"ARCHIVE" | "UNARCHIVE">(
    "ARCHIVE"
  );
  const [groupMessages, setGroupMessages] = useState<GroupMessageData[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<
    (GroupExpenseData | GroupSettlementData)[]
  >([]);
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
    removeNewMessageListener,
    sendGroupMessage,
    onNewGroupMessage,
    leaveRoom,
  } = useSocket();

  const onSendGroupMessage = async (message: string) => {
    const messageData = {
      group_id: selectedGroup?.group_id,
      sender_id: user?.user_id,
      message,
    };
    sendGroupMessage(messageData);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return; // Prevent sending empty message
    onSendGroupMessage(message);
    saveGroupMessages(message.trim(), selectedGroup?.group_id!);
    setMessage("".trim());
  };

  useEffect(() => {
    const handleNewGroupMessage = (message: GroupMessageData) => {
      const sender = getFullNameAndImage(currentMember);
      const messageWithSenderAndTime = {
        ...message,
        senderName: sender.fullName,
        senderImage: sender.imageUrl,
        createdAt: new Date().toISOString(),
      }
      setGroupMessages((prevMessages) => [...prevMessages, messageWithSenderAndTime]);
      setCombinedView((prev) => [...prev, { ...messageWithSenderAndTime, type: "message" }]);
    };

    onNewGroupMessage(handleNewGroupMessage);

    // Cleanup the listener when the component unmounts or when switching rooms
    return () => {
      removeNewMessageListener();
    };
  }, [onNewGroupMessage, removeNewMessageListener]);

  useEffect(() => {
    setGroupList(groups);
    setFilteredGroups(groups);
  }, [groups]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredGroups(groupList); // Reset if query is empty
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    switch (selected) {
      case "Groups":
        setFilteredGroups(
          groupList.filter((group) =>
            group.group_name.toLowerCase().includes(lowercasedQuery)
          )
        );
        break;
      case "Requests":
        setFilteredGroups(
          requests.filter((request) =>
            request.group_name.toLowerCase().includes(lowercasedQuery)
          )
        );
        break;
      default:
        break;
    }
  };

  const handleListChange = () => {
    switch (selected) {
      case "Groups":
        setFilteredGroups(groups);
        break;
      case "Requests":
        setFilteredGroups(requests);
        break;
      default:
        break;
    }
  };

  const clearSelectedGroup = () => {
    leaveRoom(selectedGroup?.group_id!);
    setSelectedGroup(null);
    setGroupMembers([]);
    setCurrentMember(undefined);
    setGroupMessages([]);
    setGroupExpenses([]);
    setCombinedView([]);
  };

  const handleSelectConversation = async (group: GroupData) => {
    clearSelectedGroup();
    setSelectedGroup(group);
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedGroup) return;

      const groupMembers = await fetchGroupMembers(selectedGroup.group_id);
      const currentMember = groupMembers.find(
        (member) => member.member_id === user?.user_id
      );
      setGroupMembers(groupMembers);
      setCurrentMember(currentMember);
    };

    fetchMembers();
  }, [selectedGroup]);

  useEffect(() => {
    handleListChange();
  }, [selected]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsList = await getGroups();
        setGroups(groupsList.acceptedGroups);
        setRequests(groupsList.invitedGroups);
      } catch (error) {
        toast.error("Failed to fetch groups");
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGroup(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Left Panel */}
      <div
        className={`bg-white h-full lg:flex lg:flex-col items-center col-span-1 p-4 rounded-lg space-y-6 ${
          selectedGroup ? "hidden" : "flex flex-col"
        }`}
      >
        <SearchBar
          onSearch={handleSearch}
          chats={filteredGroups}
          setChats={(newChats) => setGroups(newChats as GroupData[])}
        />
        <SwitchList
          title="Groups"
          selected={selected}
          setSelected={setSelected}
          requestsLength={requests.length}
        />
        <ChatList
          chats={filteredGroups}
          onSelectConversation={(group) =>
            handleSelectConversation(group as GroupData)
          }
        />
      </div>

      {/* Right Panel */}
      {isDetailsPage ? (
        <GroupDetailPage
          selectedGroup={selectedGroup}
          groupMembers={groupMembers}
          setGroupMembers={setGroupMembers}
          currentMember={currentMember!}
          setGroupExpenses={setGroupExpenses}
          setCombinedView={setCombinedView}
          setChats={(groups) => setGroups(groups as GroupData[])}
          setSelectedGroup={setSelectedGroup}
        />
      ) : selectedGroup ? (
        <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
          <ChatHeader
            currentView={currentView}
            setCurrentView={setCurrentView}
            chat={selectedGroup}
            setChats={(groups) => setGroups(groups as GroupData[])}
            clearSelectedChat={clearSelectedGroup}
            blockStatusGroups={blockStatus}
            setBlockStatusGroups={setBlockStatus}
            archiveStatus={archiveStatus}
            setArchiveStatus={setArchiveStatus}
            groupMembers={groupMembers}
            setGroupMembers={setGroupMembers}
            setCombinedView={setCombinedView}
            setGroupExpenses={setGroupExpenses}
          />
          <hr className="border-t-4 border-gray-400" />
          <ChatWindow
            currentView={currentView}
            chat={selectedGroup}
            groupMessages={groupMessages}
            groupExpenses={groupExpenses}
            combinedView={combinedView}
            setGroupMessages={setGroupMessages}
            setGroupExpenses={setGroupExpenses}
            setCombinedView={setCombinedView}
            groupMembers={groupMembers}
            currentMember={currentMember}
          />
          <hr className="border-t-4 border-gray-400" />
          <MessageInput
            chat={selectedGroup}
            setChats={(chats) => setGroups(chats as GroupData[])}
            blockStatusGroups={blockStatus}
            setGroupExpenses={setGroupExpenses}
            setCombinedView={setCombinedView}
            chatMembers={groupMembers}
            currentMember={currentMember}
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
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

export default GroupsPage;
