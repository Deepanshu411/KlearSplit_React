import { ArrowBack, MoreVert } from "@mui/icons-material";
import { IconButton, Select, MenuItem, Menu } from "@mui/material";
import ViewExpensesDialog from "./ViewExpensesDialog";
import React, { useState } from "react";
import Settlement from "./Settlement";
import { toast } from "sonner";
import { archiveBlockFriend } from "../friends/services";
import isFriendsConversation from "../utils/getConversationType";
import { blockGroup } from "../groups/services";

interface ChatHeaderProps {
  currentView: "All" | "Expenses" | "Messages";
  setCurrentView: (value: "All" | "Expenses" | "Messages") => void;
  chat: FriendData | GroupData | null;
  clearSelectedChat: () => void;
  blockStatus: "BLOCK" | "UNBLOCK";
  setBlockStatus: (status: "BLOCK" | "UNBLOCK") => void;
  archiveStatus: "ARCHIVE" | "UNARCHIVE";
  setArchiveStatus: (status: "ARCHIVE" | "UNARCHIVE") => void;
  groupMembers?: GroupMemberData[];
  setExpenses?: React.Dispatch<React.SetStateAction<ExpenseData[]>>;
  setGroupExpenses?: React.Dispatch<React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>>;
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
  clearSelectedChat,
  blockStatus,
  setBlockStatus,
  archiveStatus,
  setArchiveStatus,
  groupMembers,
  setExpenses,
  setGroupExpenses,
  setCombinedView,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [openViewExpenses, setOpenViewExpenses] = useState(false);
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
    "Block Group",
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

  const handleClickBlock = async () => {
    try {
      isFriendsConversation(chat!)
        ? await archiveBlockFriend(chat?.conversation_id!, "blocked")
        : await blockGroup(chat?.group_id!, false);
      setBlockStatus(blockStatus === "BLOCK" ? "UNBLOCK" : "BLOCK");
      toast.success(`Conversation ${blockStatus}ED successfully`);
    } catch {
      toast.error("Error Blocking Conversation! Please try again later.");
    }
  };

  const handleClickArchive = async () => {
    try {
      if (isFriendsConversation(chat!))
        await archiveBlockFriend(chat?.conversation_id!, "archived");
      setArchiveStatus(archiveStatus === "ARCHIVE" ? "UNARCHIVE" : "ARCHIVE");
      toast.success(`Conversation ${archiveStatus}D successfully`);
    } catch {
      toast.error("Error Archiving Conversation! Please try again later.");
    }
  };
  const handleMenuClick = (option: string) => {
    switch (option) {
      case "Settle Up":
        handleOpenSettlment();
        break;
      case "View Expenses":
        handleOpenViewExpenses();
        break;
      case "Block":
      case "Unblock":
        handleClickBlock();
        break;
      case "Archive":
      case "Unarchive":
        handleClickArchive();
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
        setCombinedView={setCombinedView}
        setExpenses={setExpenses}
        setGroupExpenses={setGroupExpenses}
      />
      <ViewExpensesDialog
        chat={chat}
        open={openViewExpenses}
        onClose={handleCloseViewExpenses}
        groupMembers={groupMembers}
      />
      <div className="flex flex-row items-center justify-between p-1">
        <div className="flex flex-row items-center gap-2">
          <IconButton onClick={clearSelectedChat}>
            <ArrowBack />
          </IconButton>
          <img
            src={
              (isFriendsConversation(chat!)
                ? chat?.friend.image_url
                : chat?.image_url) ||
              "https://randomuser.me/api/portraits/men/9.jpg"
            }
            alt="profile_image"
            className="h-10 w-10 rounded-full"
          />
          <h5 className="text-lg font-semibold">
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
