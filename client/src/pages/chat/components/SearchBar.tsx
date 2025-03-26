import { Search, PersonAddAlt1Sharp } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import AddFriend from "./AddFriend";
import { useState } from "react";

interface SearchBarProps {
  open: boolean;
  handleClickOpen: () => void;
  handleClose: () => void;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ open, handleClickOpen, handleClose, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

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
      <Tooltip title="Add Friend" arrow>
        <Button className="h-full rounded-3xl" variant="contained" color="primary" onClick={handleClickOpen}>
          <PersonAddAlt1Sharp />
        </Button>
      </Tooltip>
      <AddFriend open={open} handleClose={handleClose} />
    </div>
  );
};

export default SearchBar;