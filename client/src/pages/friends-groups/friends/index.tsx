import { useEffect, useState } from "react";
import { getFriends } from "./services";
import { toast } from "sonner";
import SearchBar from "../components/SearchBar";
import SwitchList from "../components/SwitchList";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { Typography } from "@mui/material";
const FriendsPage = () => {
    const [friends, setFriends] = useState<FriendData[]>([]);
    const [selected, setSelected] = useState("Friends");
    const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
    const [filteredFriends, setFilteredFriends] = useState(friends);

    useEffect(() => {
        setFilteredFriends(friends);
    }, [friends]);

    const handleSearch = (query: string) => {
        if (!query) {
            setFilteredFriends(friends); // Reset if query is empty
            return;
        }
        const lowercasedQuery = query.toLowerCase();
        setFilteredFriends(
            friends.filter(
                (friend) =>
                    friend.friend.first_name.toLowerCase().includes(lowercasedQuery) ||
                    friend.friend.email.toLowerCase().includes(lowercasedQuery)
            )
        );
    };

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendsList = await getFriends();
                setFriends(friendsList);
            } catch (error) {
                toast.error("Failed to fetch friends")
            }
        }
        fetchFriends()
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {/* Left Panel */}
            <div className="bg-white h-full flex flex-col items-center col-span-1 p-4 rounded-lg space-y-6">
                <SearchBar onSearch={handleSearch} />
                <SwitchList title="Friends" selected={selected} setSelected={setSelected} />
                <ChatList friends={filteredFriends} onSelectFriend={(friend) => setSelectedFriend(friend as FriendData)} />
            </div>

            {/* Right Panel */}
            {selectedFriend ?
                <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
                    <ChatHeader friend={selectedFriend} />
                    <hr className="border-t-4 border-gray-400" />
                    <ChatWindow friend={selectedFriend} />
                    <hr className="border-t-4 border-gray-400" />
                    <MessageInput />
                </div> :
                <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg items-center justify-center">
                    <Typography className="text-blue-500" fontSize={35}>Please select a chat to start!</Typography>
                </div>
            }

        </div>
    );
}

export default FriendsPage;