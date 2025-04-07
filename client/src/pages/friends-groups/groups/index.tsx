import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchGroupMembers, getGroups } from "./services";
import SearchBar from "../components/SearchBar";
import SwitchList from "../components/SwitchList";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { Typography } from "@mui/material";

const GroupsPage = () => {
  const [currentView, setCurrentView] = useState<
    "All" | "Expenses" | "Messages"
  >("All");
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [requests, setRequests] = useState<GroupData[]>([]);
  const [groupList, setGroupList] = useState<GroupData[]>([]);
  const [selected, setSelected] = useState("Groups");
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMemberData[]>([]);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [blockStatus, setBlockStatus] = useState<"BLOCK" | "UNBLOCK">("BLOCK");
  const [archiveStatus, setArchiveStatus] = useState<"ARCHIVE" | "UNARCHIVE">(
    "ARCHIVE"
  );
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [combinedView, setCombinedView] = useState<
    (CombinedMessage | CombinedExpense)[]
  >([]);

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

  const handleSelectConversation = async (group: GroupData) => {
    setSelectedGroup(group);
    const groupMembers = await fetchGroupMembers(group.group_id);
    setGroupMembers(groupMembers);
  };

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
          requestsLength={
            requests.filter((request) => request.status === "RECEIVER").length
          }
        />
        <ChatList
          chats={filteredGroups}
          onSelectConversation={(group) =>
            handleSelectConversation(group as GroupData)
          }
        />
      </div>

      {/* Right Panel */}
      {selectedGroup ? (
        <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
          <ChatHeader
            currentView={currentView}
            setCurrentView={setCurrentView}
            chat={selectedGroup}
            setSelectedChat={(group) => setSelectedGroup(group as GroupData)}
            blockStatus={blockStatus}
            setBlockStatus={setBlockStatus}
            archiveStatus={archiveStatus}
            setArchiveStatus={setArchiveStatus}
            groupMembers={groupMembers}
            setCombinedView={setCombinedView}
            setExpenses={setExpenses}
          />
          <hr className="border-t-4 border-gray-400" />
          <ChatWindow
            currentView={currentView}
            chat={selectedGroup}
            messages={messages}
            expenses={expenses}
            combinedView={combinedView}
            setMessages={setMessages}
            setExpenses={setExpenses}
            setCombinedView={setCombinedView}
          />
          <hr className="border-t-4 border-gray-400" />
          <MessageInput
            chat={selectedGroup}
            setSelectedChat={(chat) => setSelectedGroup(chat as GroupData)}
            blockStatus={blockStatus}
            setExpenses={setExpenses}
            setCombinedView={setCombinedView}
            chatMembers={groupMembers}
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
