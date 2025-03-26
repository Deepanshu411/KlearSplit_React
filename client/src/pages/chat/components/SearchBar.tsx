import { Search, PersonAddAlt1Sharp } from "@mui/icons-material";
import { Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import AddFriend from "./AddFriend";

interface SearchBarProps {
  open: boolean;
  handleClickOpen: () => void;
  handleClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ open, handleClickOpen, handleClose }) => {
  return (
    <div className="flex flex-row items-center justify-center w-full gap-2">
      <TextField
        placeholder="Search using email"
        variant="outlined"
        name="search_field"
        size="small"
        fullWidth
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