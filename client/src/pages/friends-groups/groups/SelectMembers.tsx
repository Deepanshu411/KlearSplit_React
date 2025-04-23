import { motion } from "framer-motion";
import { ModalDialog } from "@mui/joy";
import {
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Button,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useCallback, useState } from "react";
import debounce from "../../../utils/debounce";
import { X } from "lucide-react";
import { searchUser } from "../../../services/userService";
import { addGroupMembers } from "./services";
import { toast } from "sonner";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";

interface Props {
  title: "Select Members" | "Add Members";
  open: boolean;
  handleClose: () => void;
  selectedMembers?: SelectableUser[];
  onSave?: (members: SelectableUser[]) => void;
  chat: GroupData | FriendData;
  setGroupMembers?: React.Dispatch<React.SetStateAction<GroupMemberData[]>>;
}

const SelectMembersDialog: React.FC<Props> = ({
  title,
  open,
  handleClose,
  selectedMembers,
  onSave,
  chat,
  setGroupMembers,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [members, setMembers] = useState<SelectableUser[]>(
    selectedMembers ? selectedMembers : []
  );
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleConfirm = () => {
    setOpenConfirm(false);
    handleClose();
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  const onClose = () => {
    setOpenConfirm(true);
  };

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) return setSearchResults([]);
      setLoading(true);
      try {
        const results = await searchUser(q, true);
        setSearchResults(results);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  const handleSelectUser = (user: SearchedUser) => {
    if (members.find((m) => m.email === user.email)) return;
    setMembers([...members, { ...user, role: "member" }]);
    setQuery("");
    setSearchResults([]);
  };

  const updateRole = (email: string, role: string) => {
    setMembers(
      members.map((m) =>
        m.email === email
          ? { ...m, role: role as "member" | "admin" | "coadmin" }
          : m
      )
    );
  };

  const removeUser = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  const handleMembersData = (): MembersData => {
    const membersList = members.map((user) => user.user_id);
    const admins = members
      .filter((user) => user.role === "admin")
      .map((user) => user.user_id);
    const coadmins = members
      .filter((user) => user.role === "coadmin")
      .map((user) => user.user_id);

    const membersData: MembersData = {
      members: membersList,
      ...(admins.length > 0 && { admins }),
      ...(coadmins.length > 0 && { coadmins }),
    };

    return membersData;
  };

  const handleSave = async () => {
    switch (title) {
      case "Select Members":
        onSave && onSave(members);
        setMembers([]);
        setQuery("");
        setSearchResults([]);
        setLoading(false);
        handleClose();
        break;
      case "Add Members":
        const membersData = handleMembersData();
        const addedMembers = await addGroupMembers(
          membersData,
          (chat as GroupData).group_id
        );
        setGroupMembers &&
          setGroupMembers((prev) => [...prev, ...addedMembers.addedMembers]);
        handleClose();
        toast.success("Members added successfully to the group!");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <ConfirmDialog
        open={openConfirm}
        title="Are you sure?"
        description="Are you sure you want to discard the changes?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Modal open={open} onClose={onClose}>
        <motion.div
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: title === "Select Members" ? 300 : 50, opacity: 1 }}
          exit={{ x: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            height: "100%",
            width: "100%",
            zIndex: 9,
          }}
        >
          <ModalDialog
            layout="center"
            sx={{
              backgroundColor: "white",
              position: "fixed",
              top: "10",
              // minHeight: "50%",
              minWidth: "25%",
              maxWidth: "600px",
              padding: 0,
              border: "none",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              zIndex: 9,
            }}
          >
            <DialogTitle className="bg-blue-600 text-white text-center text-lg">
              {title}
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Search Users"
                value={query}
                onChange={handleSearchChange}
                margin="dense"
              />
              <div className="max-h-40 overflow-y-auto mt-2 bg-gray-100 rounded-md p-2">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <CircularProgress size={24} />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-gray-200 cursor-pointer rounded"
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.first_name} {user.last_name} ({user.email})
                    </div>
                  ))
                ) : (
                  <div className="p-2 hover:bg-gray-200 cursor-pointer rounded">
                    No Data Found
                  </div>
                )}
              </div>

              <h3 className="text-center mt-4">Selected Members</h3>
              <div className="max-h-40 overflow-y-auto mt-2 space-y-2">
                {members.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start border p-2 rounded-md"
                  >
                    <div className="flex-1">
                      <div>
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        ({user.email})
                      </div>
                    </div>
                    <TextField
                      select
                      size="small"
                      label="Role"
                      value={user.role}
                      onChange={(e) => updateRole(user.email, e.target.value)}
                    >
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="coadmin">Co-admin</MenuItem>
                    </TextField>
                    <IconButton
                      onClick={() => removeUser(user.email)}
                      className="ml-2"
                      size="small"
                    >
                      <X className="text-red-500" size={20} />
                    </IconButton>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="error">
                Cancel
              </Button>
              <Button onClick={handleSave} variant="contained">
                Add
              </Button>
            </DialogActions>
          </ModalDialog>
        </motion.div>
      </Modal>
    </>
  );
};

export default SelectMembersDialog;
