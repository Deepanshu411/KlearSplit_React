import { AddCircleOutlineRounded, Send } from "@mui/icons-material";
import { Button, TextField, Tooltip, IconButton } from "@mui/material";
import React, { useState } from "react";
import AddExpense from "./AddExpense";

interface MessageInputProps {
  chat: FriendData | GroupData;
  blockStatus?: "BLOCK" | "UNBLOCK";
  blockStatusGroups?: boolean;
  setChats: React.Dispatch<React.SetStateAction<FriendData[] | GroupData[]>>;
  //   setMessages: React.Dispatch<React.SetStateAction<MessageData[]>>;
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
  chatMembers?: GroupMemberData[];
  currentMember?: GroupMemberData;
  onSend: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  chat,
  blockStatus,
  blockStatusGroups,
  setChats,
  setExpenses,
  setCombinedView,
  chatMembers,
  currentMember,
  onSend,
}) => {
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim() === "") return; // Prevent sending empty message
    onSend(message);
    setMessage("");
  };


  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
  return (
    <>
      <AddExpense
        title="Add Expense"
        open={addExpenseDialogOpen}
        setOpen={setAddExpenseDialogOpen}
        chat={chat}
        setChats={setChats}
        handleAddExpensesClose={handleAddExpensesClose}
        setExpenses={setExpenses}
        setCombinedView={setCombinedView}
        chatMembers={chatMembers}
        currentMember={currentMember}
      />
      <div
        className={`flex flex-row items-center gap-3 p-2 pt-4 ${
          blockStatus === "UNBLOCK" || blockStatusGroups
            ? "cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        <Tooltip title="Add Expense" arrow placement="top">
          <Button
            onClick={handleAddExpensesOpen}
            variant="contained"
            color="primary"
            disabled={blockStatus === "UNBLOCK" || blockStatusGroups}
          >
            <AddCircleOutlineRounded />
          </Button>
        </Tooltip>
        <TextField
          placeholder="Type a message"
          variant="outlined"
          name="message_input"
          size="small"
          fullWidth
          focused
          multiline
          maxRows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // prevents newline on Enter
              handleSendMessage();
            }
          }}
          disabled={blockStatus === "UNBLOCK" || blockStatusGroups}
          sx={
            blockStatus === "UNBLOCK" || blockStatusGroups
              ? {
                  cursor: "not-allowed",
                }
              : {
                  cursor: "pointer",
                }
          }
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={blockStatus === "UNBLOCK" || blockStatusGroups}
        >
          <Send />
        </IconButton>
      </div>
    </>
  );
};

export default MessageInput;
