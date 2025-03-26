import { ArrowBack, MoreVert } from "@mui/icons-material";
import { IconButton, Select, MenuItem, Menu } from "@mui/material";
import ViewExpensesDialog from "./ViewExpensesDialog";

interface ChatHeaderProps {
    friend: FriendData | null;
    currentView: string;
    setCurrentView: (value: string) => void;
    handleClick: (event: React.MouseEvent<HTMLElement>) => void;
    anchorEl: null | HTMLElement;
    handleClose: () => void;
    openDialog: boolean;
    handleOpenDialog: () => void;
    handleCloseDialog: () => void;
}

const ITEM_HEIGHT = 48;
const options = [
    "Settle Up",
    "View Expenses",
    "Block",
    "Archive",
];


const ChatHeader: React.FC<ChatHeaderProps> = ({ friend, currentView, setCurrentView, handleClick, anchorEl, handleClose, openDialog, handleOpenDialog, handleCloseDialog }) => {
    const open = Boolean(anchorEl);
    const handleMenuClick = (option: string) => {
        switch (option) {
            case "Settle Up":
                break;
            case "View Expenses":
                handleOpenDialog();
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
                <ViewExpensesDialog friend={friend} open={openDialog} onClose={handleCloseDialog} />
            </div>
        </div>
    );
};

export default ChatHeader;
