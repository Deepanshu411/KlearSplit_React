import { AddCircleOutlineRounded, Send } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import { useState } from "react";
import AddExpense from "./AddExpense";

const MessageInput = () => {
    const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);

    const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
    const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
    return (
        <>
            <AddExpense open={addExpenseDialogOpen} handleAddExpensesClose={handleAddExpensesClose} />
            <div className="flex flex-row items-center gap-3 p-2 pt-4">
                <Tooltip title="Add Expense" arrow placement="top">
                    <Button onClick={handleAddExpensesOpen} variant="contained" color="primary">
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
