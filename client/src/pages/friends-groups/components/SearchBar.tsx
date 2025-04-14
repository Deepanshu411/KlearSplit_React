import { Search, PersonAddAlt1Sharp, GroupAdd } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import AddFriend from "../friends/AddFriend";
import { useState } from "react";
import isFriendsConversations from "../utils/isFriendsConversations";
import CreateGroup from "../groups/CreateGroup";

interface SearchBarProps {
  onSearch: (query: string) => void;
  chats: FriendData[] | GroupData[];
  setChats: React.Dispatch<React.SetStateAction<FriendData[] | GroupData[]>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, chats, setChats }) => {
  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenAddFriendDialog = () => {
    setOpenAddFriend(true);
  };

  const handleCloseAddFriendDialog = () => {
    setOpenAddFriend(false);
  };
  
  const handleOpenCreateGroupDialog = () => {
    setOpenCreateGroup(true);
  };

  const handleCloseCreateGroupDialog = () => {
    setOpenCreateGroup(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query); // Pass query to parent to filter the list
  };

  return (
    <div className="flex flex-row items-center justify-center w-full gap-2">
      <TextField
        placeholder="Search using email"
        variant="outlined"
        name="search_field"
        size="small"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Tooltip title={isFriendsConversations(chats) ? "Add Friend" : "Create Group"} arrow>
        <Button className="h-full rounded-3xl" variant="contained" color="primary" onClick={isFriendsConversations(chats) ? handleOpenAddFriendDialog : handleOpenCreateGroupDialog}>
          {isFriendsConversations(chats) ? <PersonAddAlt1Sharp /> : <GroupAdd />}
        </Button>
      </Tooltip>
      <AddFriend open={openAddFriend} handleClose={handleCloseAddFriendDialog} />
      <CreateGroup
        open={openCreateGroup}
        handleClose={handleCloseCreateGroupDialog}
        setGroups={isFriendsConversations(chats) ? undefined : (setChats as React.Dispatch<React.SetStateAction<GroupData[]>>)}
        title="Create Group"
      />
    </div>
  );
};

export default SearchBar;