import { ModalDialog } from "@mui/joy";
import {
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Close } from "@mui/icons-material";
import SelectMembersDialog from "./SelectMembers";
import { createGroup } from "./services";
import { toast } from "sonner";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
  setGroups?: React.Dispatch<React.SetStateAction<GroupData[]>>;
}

const CreateGroup: React.FC<CreateGroupProps> = ({
  open,
  handleClose,
  setGroups,
}) => {
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<SelectableUser[]>([]); // where MemberWithRole = User & { role: string }
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleConfirm = () => {
    setOpenConfirm(false);
    handleClose();
    onCloseMembersDialog();
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddMembers = () => {
    // open members dialog logic
    setMembersDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) return;
    // submit logic here
    const formData = new FormData();
    const groupDetails = handleGroupDetails();
    const membersData = handleMembersData();
    formData.append("group", JSON.stringify(groupDetails));
    formData.append("membersData", JSON.stringify(membersData));
    if (image) formData.append("image", image);
    try {
      const group = await createGroup(formData);
      toast.success("Group created successfully");
      if (setGroups) {
        setGroups((prevGroups) => [
          {
            ...group,
            status: "ACCEPTED",
            role: "CREATOR",
            has_archived: false,
            has_blocked: false,
            balance_amount: "0",
          } as GroupData,
          ...prevGroups,
        ]);
      }
      // Optionally, you can also close the dialog here
      handleClose();
    } catch {
      toast.error("Failed to create group");
    }
    // Reset state after submission
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Close the dialog
    handleClose();
  };

  const handleGroupDetails = () => {
    const group = {
      group_name: groupName,
      group_description: groupDescription || "",
    };
    return cleanObject(group);
  };

  const handleMembersData = () => {
    const membersData = {
      members: selectedMembers.map((user) => user.user_id),
      admins: selectedMembers
        .filter((user) => user.role === "admin")
        .map((user) => user.user_id),
      coadmins: selectedMembers
        .filter((user) => user.role === "coadmin")
        .map((user) => user.user_id),
    };
    return cleanObject(membersData);
  };

  const cleanObject = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) =>
          value !== null &&
          value !== undefined &&
          !(typeof value === "string" && value.trim() === "") &&
          !(Array.isArray(value) && value.length === 0)
      )
    );
  };

  const onCloseMembersDialog = () => {
    setMembersDialogOpen(false);
    setSelectedMembers([]);
    setGroupName("");
    setGroupDescription("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onClose = () => {
    setOpenConfirm(true);
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
      <Modal open={open} onClose={handleClose}>
        <motion.div
          initial={{ x: 0 }}
          animate={membersDialogOpen ? { x: -200 } : { x: 0 }} // Slide to the left when second modal opens
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            height: "100%",
            zIndex: 10,
          }}
        >
          <ModalDialog
            sx={{
              backgroundColor: "white",
              position: "fixed",
              top: "10",
              minWidth: "35%",
              padding: 0,
              border: "none",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              zIndex: 10,
            }}
          >
            <DialogTitle className="bg-blue-600 text-white text-center text-xl">
              Create Group
            </DialogTitle>
            <DialogContent className="flex flex-col gap-4 pt-4">
              <TextField
                required
                label="Group Name"
                margin="dense"
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onBlur={() => setGroupName(groupName.trim())}
              />
              <TextField
                label="Group Description"
                fullWidth
                multiline
                rows={3}
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                onBlur={() => setGroupDescription(groupDescription.trim())}
              />

              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="profile-image"
                  className="text-blue-600 cursor-pointer"
                >
                  {image ? image.name : "Upload Group Image"}
                </label>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                {image && (
                  <Tooltip title="Remove Image" placement="top">
                    <IconButton
                      onClick={handleRemoveImage}
                      color="error"
                      size="small"
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                )}
              </div>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddMembers}
              >
                Add Members
              </Button>

              {selectedMembers.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto bg-gray-50 rounded p-2 text-sm">
                  {selectedMembers.map((user, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b py-1"
                    >
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-gray-500">{user.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" onClick={handleSubmit}>
                Submit
              </Button>
            </DialogActions>
          </ModalDialog>
        </motion.div>
      </Modal>

      <SelectMembersDialog
        open={membersDialogOpen}
        handleClose={() => setMembersDialogOpen(false)}
        selectedMembers={selectedMembers}
        onSave={setSelectedMembers}
      />
    </>
  );
};

export default CreateGroup;
