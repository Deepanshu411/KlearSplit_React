import "./Settlement.css";
import { ModalDialog } from "@mui/joy";
import { Modal, DialogTitle, Box, Avatar, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import isFriendsConversation from "../utils/getConversationType";
import getFullNameAndImage from "../utils/getFullNameAndImage";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import { addExpense } from "../friends/services";
import { toast } from "sonner";

interface SettlementProps {
  open: boolean;
  handleSettlementClose: () => void;
  chat: FriendData | GroupData | null;
  setExpenses?: React.Dispatch<React.SetStateAction<ExpenseData[]>>;
  setGroupExpenses?: React.Dispatch<React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>>;
  setCombinedView: React.Dispatch<
    React.SetStateAction<
      (
        | CombinedMessage
        | CombinedExpense
        | CombinedGroupMessage
        | CombinedGroupExpense
        | CombinedGroupSettlement
      )[]
    >
  >;
}

const isUserPayer = (chat: FriendData | GroupData | null): boolean => {
  if (!chat) return false;
  return parseFloat(chat.balance_amount) < 0;
};

const Settlement: React.FC<SettlementProps> = ({
  open,
  handleSettlementClose,
  chat,
  setExpenses,
  setCombinedView,
}) => {
  const user = useSelector((store: RootState) => store.auth.user);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");
  const [settlementAmount, setSettlementAmount] = useState(
    Math.abs(parseFloat(chat?.balance_amount!)).toFixed(2) || "0"
  );
  const [payer, setPayer] = useState<{ fullName: string; imageUrl: string }>();
  const [debtor, setDebtor] = useState<{
    fullName: string;
    imageUrl: string;
  }>();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleConfirm = () => {
    setOpenConfirm(false);
    handleSettlementClose();
    setSettlementAmount(
      Math.abs(parseFloat(chat?.balance_amount!)).toFixed(2) || "0"
    );
    setError(false);
    setHelperText("");
    setPayer(undefined);
    setDebtor(undefined);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  const onSettlementClose = () => {
    setOpenConfirm(true);
  };
  const handleSetPayer = (chat: FriendData | GroupData | null) => {
    if (!chat) return;
    if (isFriendsConversation(chat)) {
      const payer = isUserPayer(chat)
        ? getFullNameAndImage(user!)
        : getFullNameAndImage(chat.friend);
      const debtor = !isUserPayer(chat)
        ? getFullNameAndImage(user!)
        : getFullNameAndImage(chat.friend);
      setPayer({
        fullName: payer.fullName,
        imageUrl: payer.imageUrl ?? "/static/images/avatar/1.jpg",
      });
      setDebtor({
        fullName: debtor.fullName,
        imageUrl: debtor.imageUrl ?? "/static/images/avatar/1.jpg",
      });
    }
  };

  const handleCashPayment = async () => {
    try {
      const newExpense = await addExpense(
        (chat as FriendData).conversation_id,
        { split_type: "SETTLEMENT", total_amount: settlementAmount }
      );
      toast.success("Amount settled successfully!");
      if (setExpenses) {
        setExpenses((prev) => [...prev, newExpense]);
      };
      setCombinedView((prev) => [...prev, newExpense]);
      handleSettlementClose();
    } catch (error) {
      toast.error("Something went wrong please try again later.");
    }
  };

  useEffect(() => {
    if (!open) return;
    handleSetPayer(chat);
    setSettlementAmount(
      Math.abs(parseFloat(chat?.balance_amount!)).toFixed(2) || "0"
    );
  }, [open, chat?.balance_amount]);

  const onChange = (value: string) => {
    setSettlementAmount(value);
    const numericVal = parseFloat(value);
    const maxAmount = parseFloat(chat?.balance_amount ?? "0");

    if (isNaN(numericVal) || numericVal <= 0) {
      setError(true);
      setHelperText("Amount must be greater than 0");
    } else if (numericVal > Math.abs(maxAmount)) {
      setError(true);
      setHelperText(`Amount cannot exceed ₹${Math.abs(maxAmount).toFixed(2)}`);
    } else {
      setError(false);
      setHelperText("");
    }
  };

  return (
    <>
      <ConfirmDialog
        open={openConfirm}
        title="Cancel Settlement"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Modal open={open} onClose={() => handleSettlementClose()}>
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
          }}
        >
          <DialogTitle
            className="bg-[#3674B5] text-center text-white"
            sx={{ borderRadius: "7px 7px 0px 0px" }}
          >
            Settle up
          </DialogTitle>
          <Box className="w-full self-start rounded p-3 flex flex-col gap-3">
            <Box className="flex justify-between gap-3 px-6 items-center">
              <Avatar
                alt="Remy Sharp"
                src={payer?.imageUrl}
                sx={{ width: 60, height: 60 }}
              />
              <span className="arrow"></span>
              <Avatar
                alt="Remy Sharp"
                src={debtor?.imageUrl}
                sx={{ width: 60, height: 60 }}
              />
            </Box>
            <Box className="flex justify-between gap-3 px-6 items-center">
              <h5 className="text-lg text-blue-600">{payer?.fullName!}</h5>
              <span>paid</span>
              <h5 className="text-lg text-blue-600">{debtor?.fullName!}</h5>
            </Box>
            <TextField
              label="Settlement Amount"
              required
              variant="outlined"
              name="settlement_amount"
              value={settlementAmount}
              onChange={(e) => onChange(e.target.value.trim())}
              fullWidth
              error={error}
              helperText={helperText}
            />
            <Box className="flex flex-col justify-center items-center p-3 gap-3">
              <Button
                onClick={handleCashPayment}
                variant="soft"
                disabled={error || settlementAmount === ""}
              >
                Record as Cash Payment
              </Button>
              <Button
                onClick={handleSettlementClose}
                variant="soft"
                disabled={
                  error || settlementAmount === "" || !isUserPayer(chat)
                }
              >
                Pay using Paypal
              </Button>
            </Box>
            <Box className="flex justify-end items-center p-3 gap-3">
              <Button
                onClick={onSettlementClose}
                variant="plain"
                color="danger"
              >
                Close
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default Settlement;
