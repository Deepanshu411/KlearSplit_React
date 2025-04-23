import { ArrowBack, MoreVert } from "@mui/icons-material";
import { IconButton, Select, MenuItem, Menu } from "@mui/material";
import ViewExpensesDialog from "./ViewExpensesDialog";
import React, { useState } from "react";
import Settlement from "./Settlement";
import { toast } from "sonner";
import { archiveBlockFriend } from "../friends/services";
import isFriendsConversation from "../utils/getConversationType";
import { blockGroup, leaveGroup } from "../groups/services";
import { useNavigate } from "react-router-dom";
import SelectMembersDialog from "../groups/SelectMembers";

interface ChatHeaderProps {
  currentView: "All" | "Expenses" | "Messages";
  setCurrentView: (value: "All" | "Expenses" | "Messages") => void;
  chat: FriendData | GroupData | null;
  setChats: React.Dispatch<React.SetStateAction<FriendData[] | GroupData[]>>;
  clearSelectedChat: () => void;
  blockStatus?: "BLOCK" | "UNBLOCK";
  setBlockStatus?: (status: "BLOCK" | "UNBLOCK") => void;
  blockStatusGroups?: boolean;
  setBlockStatusGroups?: (status: boolean) => void;
  archiveStatus: "ARCHIVE" | "UNARCHIVE";
  setArchiveStatus: (status: "ARCHIVE" | "UNARCHIVE") => void;
  groupMembers?: GroupMemberData[];
  currentMember?: GroupMemberData;
  setGroupMembers?: React.Dispatch<React.SetStateAction<GroupMemberData[]>>;
  setExpenses?: React.Dispatch<React.SetStateAction<ExpenseData[]>>;
  setGroupExpenses?: React.Dispatch<
    React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>
  >;
  setCombinedView: React.Dispatch<
    React.SetStateAction<
      (
        | CombinedMessage
        | CombinedExpense
        | CombinedGroupMessage
        | CombinedGroupExpense
        | CombinedGroupSettlement
      )[]
    >
  >;
}

const ITEM_HEIGHT = 48;

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentView,
  setCurrentView,
  chat,
  setChats,
  clearSelectedChat,
  blockStatus,
  setBlockStatus,
  blockStatusGroups,
  setBlockStatusGroups,
  archiveStatus,
  setArchiveStatus,
  groupMembers,
  currentMember,
  setGroupMembers,
  setExpenses,
  setGroupExpenses,
  setCombinedView,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [openViewExpenses, setOpenViewExpenses] = useState(false);
  const [openAddMembers, setOpenAddMembers] = useState(false);
  const optionsFriends = [
    "Settle Up",
    "View Expenses",
    blockStatus === "BLOCK" ? "Block" : "Unblock",
    archiveStatus === "ARCHIVE" ? "Archive" : "Unarchive",
  ];
  const optionsGroups = [
    "Group Details",
    "Add Members",
    "Settle Up",
    "View Expenses",
    blockStatusGroups ? "Unblock Group" : "Block Group",
    "Leave Group",
  ];
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOpenSettlment = () => {
    setSettlementOpen(true);
  };
  const handleCloseSettlement = () => setSettlementOpen(false);
  const handleOpenViewExpenses = () => setOpenViewExpenses(true);
  const handleCloseViewExpenses = () => setOpenViewExpenses(false);
  const handleOpenAddMembers = () => setOpenAddMembers(true);
  const handleCloseAddMembers = () => setOpenAddMembers(false);

  const handleClickBlock = async () => {
    if (parseFloat(chat?.balance_amount!) !== 0) {
      toast.warning("Please settle up before this action");
      return;
    }
    if (isFriendsConversation(chat!)) {
      const res = await archiveBlockFriend(chat?.conversation_id!, "blocked");
      if (!res) return;
      setBlockStatus &&
        setBlockStatus(blockStatus === "BLOCK" ? "UNBLOCK" : "BLOCK");
      toast.success(`Conversation ${blockStatus}ED successfully`);
    } else {
      if (typeof blockStatusGroups === "undefined" || !setBlockStatusGroups)
        return;
      const res = await blockGroup(chat?.group_id!, !blockStatusGroups);
      if (!res) return;
      setBlockStatusGroups && setBlockStatusGroups(!blockStatusGroups);
      toast.success(
        `Conversation ${
          !blockStatusGroups ? "BLOCKED" : "UNBLOCKED"
        } successfully`
      );
    }
  };

  const handleClickArchive = async () => {
    if (!isFriendsConversation(chat!)) return;
    const res = await archiveBlockFriend(chat?.conversation_id!, "archived");
    if (!res) return;
    setArchiveStatus(archiveStatus === "ARCHIVE" ? "UNARCHIVE" : "ARCHIVE");
    toast.success(`Conversation ${archiveStatus}D successfully`);
  };

  const handleClickLeaveGroup = async () => {
    if (isFriendsConversation(chat!)) return;
    if (parseFloat(chat?.balance_amount!) !== 0) {
      toast.warning("Please settle up before this action");
      return;
    }
    const res = await leaveGroup((chat as GroupData).group_id);
    if (!res) return;
    setChats((prev) => {
      const groupChats = prev as GroupData[];
      return groupChats.filter(
        (group) => group.group_id !== (chat as GroupData).group_id
      );
    });
    toast.success("Group Left Successfully!");
  };

  const handleMenuClick = (option: string) => {
    switch (option) {
      case "Settle Up":
        if (isFriendsConversation(chat!)) {
          handleOpenSettlment();
        } else {
          navigate("/groups/details");
        }
        break;
      case "View Expenses":
        handleOpenViewExpenses();
        break;
      case "Block":
      case "Unblock":
      case "Block Group":
      case "Unblock Group":
        handleClickBlock();
        break;
      case "Archive":
      case "Unarchive":
        handleClickArchive();
        break;
      case "Group Details":
        navigate("/groups/details");
        break;
      case "Add Members":
        handleOpenAddMembers();
        break;
      case "Leave Group":
        handleClickLeaveGroup();
        break;
      default:
        break;
    }
    handleClose(); // Close the menu after clicking an option
  };

  return (
    <>
      <Settlement
        open={settlementOpen}
        handleSettlementClose={handleCloseSettlement}
        chat={chat}
        setChats={setChats}
        setCombinedView={setCombinedView}
        setExpenses={setExpenses}
        setGroupExpenses={setGroupExpenses}
      />
      <ViewExpensesDialog
        chat={chat!}
        setChats={setChats}
        open={openViewExpenses}
        onClose={handleCloseViewExpenses}
        groupMembers={isFriendsConversation(chat!) ? undefined : groupMembers}
        currentMember={isFriendsConversation(chat!) ? undefined : currentMember}
        setCombinedView={setCombinedView}
      />
      <SelectMembersDialog
        title="Add Members"
        open={openAddMembers}
        handleClose={handleCloseAddMembers}
        chat={chat!}
        setGroupMembers={setGroupMembers}
      />
      <div className="flex flex-row items-center justify-between p-1">
        <div className="flex flex-row items-center gap-2">
          <IconButton onClick={clearSelectedChat}>
            <ArrowBack />
          </IconButton>
          <img
            src={
              (isFriendsConversation(chat!)
                ? chat?.friend.image_url || "/profile.png"
                : chat?.image_url) || "/groupProfile.png"
              
            }
            alt="profile_image"
            className="h-10 w-10 rounded-full cursor-pointer"
            onClick={() => {
              if (!isFriendsConversation(chat!)) navigate("/groups/details");
            }}
          />
          <h5
            className="text-lg font-semibold cursor-pointer"
            onClick={() => {
              if (!isFriendsConversation(chat!)) navigate("/groups/details");
            }}
          >
            {isFriendsConversation(chat!)
              ? chat?.friend.first_name
              : chat?.group_name}
          </h5>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Select
            value={currentView}
            onChange={(e) =>
              setCurrentView(e.target.value as "All" | "Expenses" | "Messages")
            }
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Expenses">Expenses</MenuItem>
            <MenuItem value="Messages">Messages</MenuItem>
          </Select>
          <IconButton aria-label="more" onClick={handleClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: "20ch",
                },
              },
            }}
          >
            {isFriendsConversation(chat!)
              ? optionsFriends.map((option) => (
                  <MenuItem
                    key={option}
                    selected={option === "Pyxis"}
                    onClick={() => handleMenuClick(option)}
                  >
                    {option}
                  </MenuItem>
                ))
              : optionsGroups.map((option) => (
                  <MenuItem
                    key={option}
                    selected={option === "Pyxis"}
                    onClick={() => handleMenuClick(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
          </Menu>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
