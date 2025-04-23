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
  ButtonGroup,
  TextField,
  Checkbox,
} from "@mui/material";
import Button from "@mui/joy/Button";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import isFriendsConversation from "../utils/getConversationType";

interface SplitTypeProps {
  open: boolean;
  chat: FriendData | GroupData;
  participants?: User[];
  groupParticipants?: GroupMemberData[];
  selectedGroupParticipants?: GroupMemberData[];
  setSelectedGroupParticipants?: React.Dispatch<
    React.SetStateAction<GroupMemberData[]>
  >;
  totalAmount: number;
  handleSplitTypeClose: () => void;
  splitType: "EQUAL" | "UNEQUAL" | "PERCENTAGE";
  setSplitType: (splitType: "EQUAL" | "UNEQUAL" | "PERCENTAGE") => void;
  equalShares: { [key: string]: number };
  setEqualShares: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  unequalShares: { [key: string]: number };
  setUnequalShares: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  percentageShares: { [key: string]: number };
  setPercentageShares: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  isUpdateMode?: boolean;
  groupExpenseToUpdate?: GroupExpenseData;
}

const SplitType: React.FC<SplitTypeProps> = ({
  open,
  chat,
  participants,
  groupParticipants,
  selectedGroupParticipants,
  setSelectedGroupParticipants,
  totalAmount,
  handleSplitTypeClose,
  splitType,
  setSplitType,
  equalShares,
  setEqualShares,
  unequalShares,
  setUnequalShares,
  percentageShares,
  setPercentageShares,
  isUpdateMode,
  groupExpenseToUpdate,
}) => {
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localGroupParticipants, setLocalGroupParticipants] = useState<
    GroupMemberData[]
  >([]);

  useEffect(() => {
    groupParticipants && setLocalGroupParticipants(groupParticipants);
  }, [groupParticipants]);

  useEffect(() => {
    setSelectedIds([]);
    groupParticipants && setLocalGroupParticipants(groupParticipants); // Restore full list
  }, [splitType]);

  useEffect(() => {
    if (isUpdateMode && selectedGroupParticipants && splitType === "EQUAL") {
      const ids = selectedGroupParticipants.map((p) => p.group_membership_id);
      setSelectedIds(ids);
    }
  }, [open, isUpdateMode, selectedGroupParticipants, splitType]);

  useEffect(() => {
    if (isUpdateMode) return;
    if (isFriendsConversation(chat) && participants) {
      switch (splitType) {
        case "EQUAL":
          const equalShare = totalAmount / participants.length;
          const updatedShares = participants.reduce((acc, participant) => {
            acc[participant.user_id] = equalShare;
            return acc;
          }, {} as { [key: string]: number });
          setEqualShares(updatedShares);
          break;
        case "UNEQUAL":
          setUnequalShares(
            participants.reduce((acc, participant) => {
              acc[participant.user_id] = 0;
              return acc;
            }, {} as { [key: string]: number })
          );
          break;
        case "PERCENTAGE":
          setPercentageShares(
            participants.reduce((acc, participant) => {
              acc[participant.user_id] = 0;
              return acc;
            }, {} as { [key: string]: number })
          );
          break;
        default:
          break;
      }
    } else {
      switch (splitType) {
        case "EQUAL":
          const equalShare = totalAmount / localGroupParticipants.length;
          let sumSoFar = 0;

          const updatedShares = localGroupParticipants.reduce(
            (acc, participant, index) => {
              const isLast = index === localGroupParticipants.length - 1;
              const id = participant.group_membership_id;

              let share;

              if (isLast) {
                // Assign remaining amount to the last participant
                share = Math.round((totalAmount - sumSoFar) * 100) / 100;
              } else {
                share = Math.round(equalShare * 100) / 100;
                sumSoFar += share;
              }

              // Only include non-zero shares
              if (share !== 0) {
                acc[id] = share;
              }

              return acc;
            },
            {} as { [key: string]: number }
          );

          setEqualShares(updatedShares);
          break;
        case "UNEQUAL":
          setUnequalShares(
            localGroupParticipants.reduce((acc, participant) => {
              acc[participant.group_membership_id] = 0;
              return acc;
            }, {} as { [key: string]: number })
          );
          break;
        case "PERCENTAGE":
          setPercentageShares(
            localGroupParticipants.reduce((acc, participant) => {
              acc[participant.group_membership_id] = 0;
              return acc;
            }, {} as { [key: string]: number })
          );
          break;
        default:
          break;
      }
    }
  }, [
    splitType,
    participants,
    localGroupParticipants,
    selectedGroupParticipants,
    totalAmount,
  ]);

  useEffect(() => {
    let total = 0;
    switch (splitType) {
      case "UNEQUAL":
        total = Object.values(unequalShares).reduce(
          (sum, value) => sum + value,
          0
        );
        setIsValid(total === totalAmount);
        setErrorMessage(
          total !== totalAmount ? "Total must match the amount" : ""
        );
        break;
      case "PERCENTAGE":
        total = Object.values(percentageShares).reduce(
          (sum, value) => sum + value,
          0
        );
        setIsValid(total === 100);
        setErrorMessage(total !== 100 ? "Total percentage must be 100" : "");
        break;
      default:
        setIsValid(true);
        setErrorMessage("");
        break;
    }
  }, [unequalShares, percentageShares, splitType, totalAmount]);

  const handleViewChange = (view: "EQUAL" | "UNEQUAL" | "PERCENTAGE") =>
    setSplitType(view);

  const handleChange = (userId: string, value: number) => {
    const newValue = Math.max(0, value);
    if (splitType === "UNEQUAL") {
      setUnequalShares((prev) => ({ ...prev, [userId]: newValue }));
    } else if (splitType === "PERCENTAGE") {
      setPercentageShares((prev) => ({ ...prev, [userId]: newValue }));
    }
  };

  const totalAllocated =
    splitType === "UNEQUAL"
      ? Object.values(unequalShares).reduce(
          (sum, value) => sum - value,
          totalAmount
        )
      : Object.values(percentageShares).reduce(
          (sum, value) => sum - value,
          100
        );

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const confirmSelectedParticipants = () => {
    const filtered = localGroupParticipants.filter((p) =>
      selectedIds.includes(p.group_membership_id)
    );
    if (splitType === "EQUAL") {
      setLocalGroupParticipants(filtered);
      if (
        isUpdateMode &&
        groupExpenseToUpdate &&
        selectedGroupParticipants &&
        setSelectedGroupParticipants
      ) {
        setSelectedGroupParticipants(filtered);
        const equalShare =
          parseFloat(groupExpenseToUpdate.total_amount) /
          selectedGroupParticipants.length;
        let sumSoFar = 0;

        const updatedShares = selectedGroupParticipants.reduce(
          (acc, participant, index) => {
            const isLast = index === selectedGroupParticipants.length - 1;
            const id = participant.group_membership_id;

            let share;

            if (isLast) {
              // Assign remaining amount to the last participant
              share =
                Math.round(
                  (parseFloat(groupExpenseToUpdate.total_amount) - sumSoFar) *
                    100
                ) / 100;
            } else {
              share = Math.round(equalShare * 100) / 100;
              sumSoFar += share;
            }

            // Only include non-zero shares
            if (share !== 0) {
              acc[id] = share;
            }

            return acc;
          },
          {} as { [key: string]: number }
        );
        setEqualShares(updatedShares);
      }
    }
    handleSplitTypeClose();
  };

  return (
    <Modal hideBackdrop={true} open={open} onClose={handleSplitTypeClose}>
      <motion.div
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: 200, opacity: 1 }}
        exit={{ x: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ height: "100%", zIndex: 9 }}
      >
        <ModalDialog
          layout="center"
          sx={{
            backgroundColor: "white",
            position: "fixed",
            minWidth: "25%",
            padding: 0,
            border: "none",
            zIndex: 9,
          }}
        >
          <DialogTitle
            className="bg-[#3674B5] text-center text-white"
            sx={{ borderRadius: "7px 7px 0px 0px" }}
          >
            Choose Split Option
          </DialogTitle>
          <Box className="w-full p-3">
            <ButtonGroup
              variant="outlined"
              className="grid"
              aria-label="split-options"
            >
              {(["EQUAL", "UNEQUAL", "PERCENTAGE"] as const).map((option) => (
                <Button
                  key={option}
                  onClick={() => handleViewChange(option)}
                  variant={splitType === option ? "solid" : "outlined"}
                >
                  {option}
                </Button>
              ))}
            </ButtonGroup>
            <Divider />
          </Box>
          <Box className="bg-white flex flex-col">
            <Box className="bg-white flex flex-col max-h-[35vh] overflow-auto">
              {isFriendsConversation(chat)
                ? participants &&
                  participants.map((participant) => (
                    <React.Fragment key={participant.user_id}>
                      <ListItem disablePadding alignItems="flex-start">
                        <ListItemButton sx={{ paddingX: 1 }}>
                          <ListItemAvatar
                            sx={{ minWidth: 32, paddingRight: 1 }}
                          >
                            <Avatar
                              alt={participant.first_name}
                              src={participant.image_url ?? "/profile.png"}
                              sx={{ width: 32, height: 32 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box className="flex justify-between">
                                {participant.first_name} {participant.last_name}
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                sx={{ color: "text.primary" }}
                              >
                                {participant.email}
                              </Typography>
                            }
                          />
                          <TextField
                            type="number"
                            size="small"
                            value={
                              splitType === "EQUAL"
                                ? equalShares[participant.user_id]
                                : splitType === "UNEQUAL"
                                ? unequalShares[participant.user_id] || ""
                                : percentageShares[participant.user_id] || ""
                            }
                            disabled={splitType === "EQUAL"}
                            onChange={(e) =>
                              handleChange(
                                participant.user_id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={
                              splitType === "EQUAL" ? "cursor-not-allowed" : ""
                            }
                            sx={{ maxWidth: 80 }}
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                : localGroupParticipants.map((participant) => (
                    <React.Fragment key={participant.group_membership_id}>
                      <ListItem disablePadding alignItems="flex-start">
                        <ListItemButton sx={{ paddingX: 1 }}>
                          <ListItemAvatar
                            sx={{ minWidth: 32, paddingRight: 1 }}
                          >
                            <Avatar
                              alt={participant.first_name}
                              src={participant.image_url ?? "/profile.png"}
                              sx={{ width: 32, height: 32 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box className="flex justify-between">
                                {participant.first_name} {participant.last_name}
                              </Box>
                            }
                          />
                          {splitType === "EQUAL" ? (
                            <Checkbox
                              checked={selectedIds.includes(
                                participant.group_membership_id
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  participant.group_membership_id
                                )
                              }
                            />
                          ) : (
                            <TextField
                              type="number"
                              size="small"
                              value={
                                splitType === "UNEQUAL"
                                  ? unequalShares[
                                      participant.group_membership_id
                                    ] || ""
                                  : percentageShares[
                                      participant.group_membership_id
                                    ] || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  participant.group_membership_id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              sx={{ maxWidth: 80 }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
              {splitType !== "EQUAL" && (
                <Typography align="center" className="p-3">
                  {totalAllocated} out of{" "}
                  {splitType === "PERCENTAGE" ? 100 : totalAmount} left
                </Typography>
              )}
              {errorMessage && (
                <Typography color="error" align="center">
                  {errorMessage}
                </Typography>
              )}
            </Box>
            <Box className="flex justify-end items-center p-3 gap-3">
              <Button onClick={handleSplitTypeClose}>Cancel</Button>
              <Button disabled={!isValid} onClick={confirmSelectedParticipants}>
                Submit
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </motion.div>
    </Modal>
  );
};

export default SplitType;
