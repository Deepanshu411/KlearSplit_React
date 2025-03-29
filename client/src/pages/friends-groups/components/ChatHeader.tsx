import { ArrowBack, MoreVert } from "@mui/icons-material";
import { IconButton, Select, MenuItem, Menu } from "@mui/material";
import ViewExpensesDialog from "./ViewExpensesDialog";
import { useState } from "react";
import Settlement from "./Settlement";

interface ChatHeaderProps {
    friend: FriendData | null;
}

const ITEM_HEIGHT = 48;
const options = [
    "Settle Up",
    "View Expenses",
    "Block",
    "Archive",
];

const ChatHeader: React.FC<ChatHeaderProps> = ({ friend }) => {
    const [currentView, setCurrentView] = useState("All");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [settlementOpen, setSettlementOpen] = useState(false);
    const [openViewExpenses, setOpenViewExpenses] = useState(false);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleOpenSettlment = () => {
        setSettlementOpen(true);
    }
    const handleCloseSettlement = () => setSettlementOpen(false);
    const handleOpenViewExpenses = () => setOpenViewExpenses(true);

    const handleCloseViewExpenses = () => setOpenViewExpenses(false);
    const handleMenuClick = (option: string) => {
        switch (option) {
            case "Settle Up":
                handleOpenSettlment();
                break;
            case "View Expenses":
                handleOpenViewExpenses();
                break;
            case "Block":
                break;
            case "Archive":
                break;
            default:
                break
        }
        handleClose(); // Close the menu after clicking an option
    };

    return (
        <>
            <Settlement open={settlementOpen} handleSettlementClose={handleCloseSettlement} />
            <ViewExpensesDialog friend={friend} open={openViewExpenses} onClose={handleCloseViewExpenses} />
            <div className="flex flex-row items-center justify-between p-2">
                <div className="flex flex-row items-center gap-2">
                    <IconButton>
                        <ArrowBack />
                    </IconButton>
                    <img src={friend?.friend.image_url || "https://randomuser.me/api/portraits/men/9.jpg"} alt="profile_image" className="h-10 w-10 rounded-full" />
                    <h5 className="text-lg font-semibold">{friend?.friend.first_name}</h5>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Select value={currentView} onChange={(e) => setCurrentView(e.target.value)}>
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
                                    width: '20ch',
                                },
                            },
                        }}
                    >
                        {options.map((option) => (
                            <MenuItem key={option} selected={option === 'Pyxis'} onClick={() => handleMenuClick(option)}>
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
