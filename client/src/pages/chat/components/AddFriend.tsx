import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, TextField, CircularProgress
} from "@mui/material";
import { addFriend, searchUser } from "../friends/services";
import { useCallback, useState } from "react";
import debounce from "../../../utils/debounce";
import { toast } from "sonner";

interface User {
    first_name: string;
    last_name: string;
    email: string;
}

interface AddFriendProps {
    open: boolean;
    handleClose: () => void;
}

const AddFriend: React.FC<AddFriendProps> = ({ open, handleClose }) => {
    const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [validEmail, setValidEmail] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSearchedUsers([]);
                return;
            }

            setLoading(true); // Show loader while fetching

            try {
                const users = await searchUser(query);
                setSearchedUsers(users);
            } catch (error) {
                toast.error("Error finding user! Please try later.");
                setSearchedUsers([]);
            } finally {
                setLoading(false); // Hide loader after fetching
            }
        }, 500),
        []
    );

    // Handle input change
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setInputValue(query);
        setSelectedUser(null); // Reset selected user when typing
        setValidEmail(false);

        debouncedSearch(query);
    };

    // Handle user selection
    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setInputValue(user.email);
        setSearchedUsers([]); // Hide user list after selection
        setValidEmail(true);
    };

    const handleSubmit = async () => {
        try {
            console.log(inputValue);
            await addFriend(inputValue.trim()); // Send as a string
            toast.success("Friend added successfully!");
            handleClose(); // Close dialog on success
        } catch (error) {
            toast.error("Failed to add friend. Please try again.");
        }
    };
    

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: "form",
                    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        await handleSubmit();
                    }
                },
            }}
        >
            <DialogTitle className="text-white text-4xl text-center bg-blue-600">
                Add Friend for Easy Bill Splitting.
            </DialogTitle>
            <DialogContent className="pt-4">
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="email"
                    label="Search by Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={inputValue}
                    onChange={handleSearch}
                />

                {/* Search Results */}
                <div className="max-h-60 overflow-auto mt-2 bg-gray-100 rounded-md shadow-inner p-2">
                    {loading ? (
                        <div className="flex justify-center items-center py-4">
                            <CircularProgress size={24} />
                        </div>
                    ) : selectedUser ?
                        <div
                            className="p-2 border-b last:border-b-0 flex flex-col cursor-pointer hover:bg-gray-200 rounded-md"
                        >
                            <span className="text-lg font-semibold">{selectedUser.first_name} {selectedUser.last_name}</span>
                            <span className="text-sm text-gray-600">{selectedUser.email}</span>
                        </div> :
                        searchedUsers.length > 0 ? (
                            searchedUsers.map((user, index) => (
                                <div
                                    key={index}
                                    className="p-2 border-b last:border-b-0 flex flex-col cursor-pointer hover:bg-gray-200 rounded-md"
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <span className="text-lg font-semibold">{user.first_name} {user.last_name}</span>
                                    <span className="text-sm text-gray-600">{user.email}</span>
                                </div>
                            ))
                        ) : (
                            <DialogContentText className="text-gray-500 text-center">
                                No users found
                            </DialogContentText>
                        )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={!validEmail}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddFriend;
