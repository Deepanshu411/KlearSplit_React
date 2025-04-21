import { ModalDialog } from "@mui/joy";
import {
  Modal,
  DialogTitle,
  Box,
  Typography,
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import Button from "@mui/joy/Button";
import { motion } from "framer-motion";
import isFriendsConversation from "../utils/getConversationType";
import React from "react";

interface PayerProps {
  open: boolean;
  chat: FriendData | GroupData;
  participants?: User[];
  groupParticipants?: GroupMemberData[];
  handlePayerDialogClose: () => void;
  payer?: User;
  setPayer?: (payer: User) => void;
  groupPayer?: GroupMemberData;
  setGroupPayer?: (payer: GroupMemberData) => void;
}

const Payer: React.FC<PayerProps> = ({
  open,
  chat,
  participants,
  groupParticipants,
  handlePayerDialogClose,
  payer,
  setPayer,
  groupPayer,
  setGroupPayer,
}) => {
  const handleSetPayer = (payer: User) => {
    setPayer && setPayer(payer);
    handlePayerDialogClose();
  };
  const handleSetGroupPayer = (payer: GroupMemberData) => {
    setGroupPayer && setGroupPayer(payer);
    handlePayerDialogClose();
  };

  return (
    <Modal
      hideBackdrop={true}
      open={open}
      onClose={() => handlePayerDialogClose()}
    >
      <motion.div
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: 200, opacity: 1 }}
        exit={{ x: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          height: "100%",
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
            padding: 0,
            border: "none",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            zIndex: 9,
          }}
        >
          {/* <ModalClose onClick={() => handleViewExpensesClose()} /> */}
          <DialogTitle
            className="bg-[#3674B5] text-center text-white"
            sx={{ borderRadius: "7px 7px 0px 0px" }}
          >
            Choose Payer
          </DialogTitle>
          <Box className="rounded bg-[white] flex flex-col">
            {isFriendsConversation(chat)
              ? participants &&
                participants.map((participant) => (
                    <React.Fragment key={participant.user_id}>
                      <ListItem
                        disablePadding
                        alignItems="flex-start"
                        onClick={() => handleSetPayer(participant)}
                        className="cursor-pointer"
                        sx={{
                          backgroundColor:
                            payer?.user_id === participant.user_id
                              ? "primary.100"
                              : "transparent",
                          borderRadius: 2,
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "primary.50",
                          },
                        }}
                      >
                        <ListItemButton sx={{ paddingX: 1 }}>
                          <ListItemAvatar
                            sx={{ minWidth: 32, paddingRight: 1 }}
                          >
                            <Avatar
                              alt="Remy Sharp"
                              src="/profile.png"
                              sx={{ width: 32, height: 32 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box className="flex justify-between">
                                <Box>
                                  {`${participant.first_name} ${
                                    participant.last_name || ""
                                  }`.trim()}
                                </Box>
                              </Box>
                            }
                            secondary={
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: "text.primary",
                                  display: "inline",
                                }}
                              >
                                {participant.email}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
              : groupParticipants &&
                groupParticipants.map((participant) => (
                    <React.Fragment key={participant.group_membership_id}>
                      <ListItem
                        disablePadding
                        alignItems="flex-start"
                        onClick={() => handleSetGroupPayer(participant)}
                        className="cursor-pointer"
                        sx={{
                          backgroundColor:
                            groupPayer?.group_membership_id === participant.group_membership_id
                              ? "#dbeafe"
                              : "transparent",
                          borderRadius: 2,
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "#eff6ff",
                          },
                        }}
                      >
                        <ListItemButton sx={{ paddingX: 1 }}>
                          <ListItemAvatar
                            sx={{ minWidth: 32, paddingRight: 1 }}
                          >
                            <Avatar
                              alt="Remy Sharp"
                              src="/profile.png"
                              sx={{ width: 32, height: 32 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box className="flex justify-between">
                                <Box>
                                  {`${participant.first_name} ${
                                    participant.last_name || ""
                                  }`.trim()}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
            <Box className="flex justify-end items-center p-3">
              <Button onClick={handlePayerDialogClose}>Cancel</Button>
            </Box>
          </Box>
        </ModalDialog>
      </motion.div>
    </Modal>
  );
};

export default Payer;
