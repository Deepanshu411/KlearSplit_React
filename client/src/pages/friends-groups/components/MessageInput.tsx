import { AddCircleOutlineRounded, Send } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import React, { useState } from "react";
import AddExpense from "./AddExpense";

interface MessageInputProps {
  chat: FriendData | GroupData;
  blockStatus?: "BLOCK" | "UNBLOCK";
  blockStatusGroups?: boolean;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<FriendData | GroupData | null>
  >;
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
}

const MessageInput: React.FC<MessageInputProps> = ({
  chat,
  blockStatus,
  blockStatusGroups,
  setSelectedChat,
  setExpenses,
  setCombinedView,
  chatMembers,
}) => {
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);

  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
  return (
    <>
      <AddExpense
        open={addExpenseDialogOpen}
        chat={chat}
        setSelectedChat={(chat) => {
          setSelectedChat(chat as FriendData);
        }}
        handleAddExpensesClose={handleAddExpensesClose}
        setExpenses={setExpenses}
        setCombinedView={setCombinedView}
        chatMembers={chatMembers}
      />
      <div
        className={`flex flex-row items-center gap-3 p-2 pt-4 ${
          (blockStatus === "UNBLOCK") || blockStatusGroups ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <Tooltip title="Add Expense" arrow placement="top">
          <Button
            onClick={handleAddExpensesOpen}
            variant="contained"
            color="primary"
            disabled={(blockStatus === "UNBLOCK") || blockStatusGroups}
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
          multiline
          maxRows={2}
          disabled={blockStatus === "UNBLOCK"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Send />
              </InputAdornment>
            ),
          }}
        />
      </div>
    </>
  );
};

export default MessageInput;
