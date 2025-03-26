import { AddCircleOutlineRounded, Send } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";

const MessageInput = () => {
    return (
        <div className="flex flex-row items-center gap-3 p-2 pt-4">
            <Tooltip title="Add Expense" arrow placement="top">
                <Button variant="contained" color="primary">
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
    );
};

export default MessageInput;
