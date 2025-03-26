import SearchBar from "./SearchBar";
import ChatList from "./ChatList";
import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import { useEffect, useState } from "react";
import SwitchList from "./SwitchList";
import { Typography } from "@mui/material";

interface MainLayoutProps {
    title: string;
    items: any[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ title, items }) => {
    const [selected, setSelected] = useState(title);
    const [currentView, setCurrentView] = useState("All");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(false);
    const [openViewExpenses, setOpenViewExpenses] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
    const [filteredFriends, setFilteredFriends] = useState(items);

    useEffect(() => {
        setFilteredFriends(items);
    }, [items]);

    const handleSearch = (query: string) => {
        if (!query) {
            setFilteredFriends(items); // Reset if query is empty
            return;
        }
        const lowercasedQuery = query.toLowerCase();
        setFilteredFriends(
            items.filter(
                (friend) =>
                    friend.friend.first_name.toLowerCase().includes(lowercasedQuery) ||
                    friend.friend.email.toLowerCase().includes(lowercasedQuery)
            )
        );
    };

    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleOpenViewExpenses = () => {
        setOpenViewExpenses(true);
    };

    const handleCloseViewExpenses = () => {
        setOpenViewExpenses(false);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {/* Left Panel */}
            <div className="bg-white h-full flex flex-col items-center col-span-1 p-4 rounded-lg space-y-6">
                <SearchBar open={open} handleClickOpen={handleOpenDialog} handleClose={handleCloseDialog} onSearch={handleSearch} />
                <SwitchList title={title} selected={selected} setSelected={setSelected} />
                <ChatList friends={filteredFriends} onSelectFriend={setSelectedFriend} />
            </div>

            {/* Right Panel */}
            {selectedFriend ?
                <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
                    <ChatHeader friend={selectedFriend} currentView={currentView} setCurrentView={setCurrentView} handleClick={handleClick} anchorEl={anchorEl} handleClose={handleClose} openDialog={openViewExpenses} handleOpenDialog={handleOpenViewExpenses} handleCloseDialog={handleCloseViewExpenses} />
                    <hr className="border-t-4 border-gray-500" />
                    <ChatWindow />
                    <hr className="border-t-4 border-gray-500" />
                    <MessageInput />
                </div> :
                <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
                    <Typography>Please select a chat to start!</Typography>
                </div>
            }

        </div>
    );
};

export default MainLayout;
