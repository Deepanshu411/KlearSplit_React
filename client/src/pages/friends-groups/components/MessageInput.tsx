import { AddCircleOutlineRounded, Send } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import React, { useState } from "react";
import AddExpense from "./AddExpense";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

interface MessageInputProps {
    friend: FriendData;
    blockStatus: "BLOCK" | "UNBLOCK";
}

const MessageInput: React.FC<MessageInputProps> = ({ friend, blockStatus }) => {
    const user = useSelector((store: RootState) => store.auth.user);
    const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
    const [payer, setPayer] = useState<User | null>(user);
    const [splitType, setSplitType] = useState<"EQUAL" | "UNEQUAL" | "PERCENTAGE">("EQUAL");

    const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
    const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
    return (
        <>
            <AddExpense open={addExpenseDialogOpen} friend={friend} handleAddExpensesClose={handleAddExpensesClose} payer={payer} setPayer={setPayer} splitType={splitType} setSplitType={setSplitType} />
            <div className={`flex flex-row items-center gap-3 p-2 pt-4 ${blockStatus === "UNBLOCK" ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <Tooltip title="Add Expense" arrow placement="top">
                    <Button
                        onClick={handleAddExpensesOpen}
                        variant="contained" color="primary"
                        disabled={blockStatus === "UNBLOCK"}
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
