import { ModalDialog } from "@mui/joy";
import {
  Modal,
  DialogTitle,
  Box,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useEffect, useState } from "react";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import Button from "@mui/joy/Button";
import Payer from "./Payer";
import { motion } from "framer-motion";
import SplitType from "./SplitType";
import { addExpense, bulkAddExpenses, updateExpense } from "../friends/services";
import { toast } from "sonner";
import isFriendsConversation from "../utils/getConversationType";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import { addGroupExpense, updateGroupExpense } from "../groups/services";
import getFullNameAndImage from "../utils/getFullNameAndImage";
import { isGroupExpense } from "../utils/getExpenseType";
import updateBalance from "../utils/updateBalance";
import {
  isCombinedExpense,
  isCombinedGroupExpense,
} from "../utils/getCombinedItemType";
import BulkInsert from "../friends/BulkInsert";
import isUserPayer from "../utils/getGroupPayer";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

interface AddExpenseProps {
  title: "Add Expense" | "Update Expense";
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  chat: FriendData | GroupData;
  setChats: React.Dispatch<React.SetStateAction<FriendData[] | GroupData[]>>;
  handleAddExpensesClose: () => void;
  setExpenses?: React.Dispatch<React.SetStateAction<ExpenseData[]>>;
  setGroupExpenses?: React.Dispatch<
    React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>
  >;
  setFriendExpensesView?: React.Dispatch<React.SetStateAction<ExpenseData[]>>;
  setGroupExpensesView?: React.Dispatch<
    React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>
  >;
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
  chatMembers?: GroupMemberData[];
  currentMember?: GroupMemberData;
  friendExpenseToUpdate?: ExpenseData;
  groupExpenseToUpdate?: GroupExpenseData | GroupSettlementData;
}

const AddExpense: React.FC<AddExpenseProps> = ({
  title,
  open,
  setOpen,
  chat,
  setChats,
  handleAddExpensesClose,
  setExpenses,
  setGroupExpenses,
  setFriendExpensesView,
  setGroupExpensesView,
  setCombinedView,
  chatMembers,
  currentMember,
  friendExpenseToUpdate,
  groupExpenseToUpdate,
}) => {
  const user = useSelector((store: RootState) => store.auth.user);
  const [participants, setParticipants] = useState<User[] | []>([]);
  const [groupParticipants, setGroupParticipants] = useState<
    GroupMemberData[] | []
  >([]);
  const [selectedGroupParticipants, setSelectedGroupParticipants] = useState<
    GroupMemberData[] | []
  >([]);
  const [payer, setPayer] = useState<User | null>(user);
  const [groupPayer, setGroupPayer] = useState<GroupMemberData | null>(
    currentMember ?? null
  );
  const [splitType, setSplitType] = useState<
    "EQUAL" | "UNEQUAL" | "PERCENTAGE"
  >("EQUAL");
  const [equalShares, setEqualShares] = useState<{ [key: string]: number }>({});
  const [unequalShares, setUnequalShares] = useState<{ [key: string]: number }>(
    {}
  );
  const [percentageShares, setPercentageShares] = useState<{
    [key: string]: number;
  }>({});
  const [expenseInfo, setExpenseInfo] = useState({
    expense_name: "",
    total_amount: "",
    description: "",
    payer_id: user?.user_id,
    debtor_id: "",
    participant1_share: 0,
    participant2_share: 0,
    split_type: "EQUAL",
    receipt: null,
  });
  const [groupExpenseInfo, setGroupExpenseInfo] = useState({
    expense_name: "",
    total_amount: "",
    description: "",
    payer_id: currentMember?.group_membership_id,
    payer_share: 0,
    split_type: "EQUAL",
    receipt: null,
    debtors: [] as { debtor_id: string; debtor_share: number }[],
  });
  const [errors, setErrors] = useState({
    expense_name: "",
    total_amount: "",
    description: "",
  });
  const [payerDialogOpen, setPayerDialogOpen] = useState(false);
  const [splitTypeOpen, setSplitTypeOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openBulkAddExpense, setOpenBulkAddExpense] = useState(false);

  const handleAddedExpenses = () => {
    setOpenBulkAddExpense(false);
  };

  const isCurrentMemberPayer =
    groupExpenseToUpdate &&
    groupExpenseToUpdate.payer_id === currentMember?.group_membership_id;

  useEffect(() => {
    switch (title) {
      case "Add Expense":
        if (isFriendsConversation(chat)) {
          setParticipants([user!, { ...chat.friend, phone: "" }]);
        } else {
          setGroupParticipants(
            chatMembers?.filter((member) => member.deletedAt === null)!
          );
        }
        break;
      case "Update Expense":
        populateExpenseDetails();
    }
  }, [title, open, friendExpenseToUpdate]);

  const populateExpenseDetails = () => {
    if (isFriendsConversation(chat) && friendExpenseToUpdate) {
      setParticipants([user!, { ...chat.friend, phone: "" }]);
      let participant1_share = 0;
      let participant2_share = 0;
      const isUserPayer = friendExpenseToUpdate.payer_id === user?.user_id;
      switch (friendExpenseToUpdate.split_type) {
        case "EQUAL": {
          participant1_share =
            parseFloat(friendExpenseToUpdate.total_amount) / 2;
          participant2_share =
            parseFloat(friendExpenseToUpdate.total_amount) / 2;
          setEqualShares((prev) => ({
            ...prev,
            [user?.user_id!]: participant1_share,
            [chat.friend.user_id]: participant2_share,
          }));
          break;
        }
        case "UNEQUAL": {
          participant1_share = isUserPayer
            ? parseFloat(friendExpenseToUpdate.total_amount) -
              parseFloat(friendExpenseToUpdate.debtor_amount)
            : parseFloat(friendExpenseToUpdate.debtor_amount);
          participant2_share = !isUserPayer
            ? parseFloat(friendExpenseToUpdate.total_amount) -
              parseFloat(friendExpenseToUpdate.debtor_amount)
            : parseFloat(friendExpenseToUpdate.debtor_amount);
          setUnequalShares((prev) => ({
            ...prev,
            [user?.user_id!]: participant1_share,
            [chat.friend.user_id]: participant2_share,
          }));
          break;
        }
        case "PERCENTAGE": {
          const payerPercentage =
            Math.round(
              (parseFloat(friendExpenseToUpdate.total_amount) -
                parseFloat(friendExpenseToUpdate.debtor_amount)) /
                parseFloat(friendExpenseToUpdate.total_amount)
            ) * 100;
          const debtorPercentage =
            Math.round(
              parseFloat(friendExpenseToUpdate.debtor_amount) /
                parseFloat(friendExpenseToUpdate.total_amount)
            ) * 100;
          participant1_share = isUserPayer ? payerPercentage : debtorPercentage;
          participant2_share = !isUserPayer
            ? payerPercentage
            : debtorPercentage;
          setPercentageShares((prev) => ({
            ...prev,
            [user?.user_id!]: participant1_share,
            [chat.friend.user_id]: participant2_share,
          }));
        }
      }
      setExpenseInfo({
        expense_name: friendExpenseToUpdate?.expense_name,
        total_amount: friendExpenseToUpdate?.total_amount,
        description: friendExpenseToUpdate.description ?? "",
        payer_id: friendExpenseToUpdate.payer_id,
        debtor_id: friendExpenseToUpdate.debtor_id,
        participant1_share: participant1_share,
        participant2_share: participant2_share,
        split_type: friendExpenseToUpdate.split_type,
        receipt: null,
      });
      setPayer(
        friendExpenseToUpdate.payer_id === user?.user_id
          ? user
          : { ...chat.friend, phone: "" }
      );
      setSplitType(
        friendExpenseToUpdate.split_type as "EQUAL" | "UNEQUAL" | "PERCENTAGE"
      );
      setIsFormValid(true);
      const updatedBalanceAmount = updateBalance(
        chat.balance_amount,
        parseFloat(friendExpenseToUpdate.debtor_amount),
        friendExpenseToUpdate.payer_id !== user?.user_id
      );
      setChats((prev) => {
        const friendChats = prev as FriendData[];
        return friendChats.map((c) =>
          c.conversation_id === chat.conversation_id
            ? { ...c, balance_amount: updatedBalanceAmount }
            : c
        );
      });
    } else {
      if (!groupExpenseToUpdate) return;
      if (!isGroupExpense(groupExpenseToUpdate)) return;
      const expenseParticipants = [
        ...groupExpenseToUpdate.participants.map((participant) => {
          const member = chatMembers?.find(
            (member) => member.group_membership_id === participant.debtor_id
          );
          return member ?? null;
        }),
        groupExpenseToUpdate.total_amount !==
        groupExpenseToUpdate.total_debt_amount
          ? chatMembers?.find(
              (member) =>
                member.group_membership_id === groupExpenseToUpdate.payer_id
            )
          : null,
      ].filter(Boolean) as GroupMemberData[];
      setGroupParticipants(expenseParticipants);
      setSelectedGroupParticipants(expenseParticipants);
      switch (groupExpenseToUpdate.split_type) {
        case "EQUAL": {
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
          break;
        }
        case "UNEQUAL": {
          const payerShare =
            parseFloat(groupExpenseToUpdate.total_amount) -
            parseFloat(groupExpenseToUpdate.total_debt_amount);
          const debtorsShares = groupExpenseToUpdate.participants.reduce(
            (acc, participant) => ({
              ...acc,
              [participant.debtor_id]: parseFloat(participant.debtor_amount),
            }),
            {} as { [key: string]: number }
          );
          setUnequalShares({
            ...debtorsShares,
            [groupExpenseToUpdate.payer_id]: payerShare,
          });
          break;
        }
        case "PERCENTAGE": {
          const payerPercentage =
            Math.round(
              (parseFloat(groupExpenseToUpdate.total_amount) -
                parseFloat(groupExpenseToUpdate.total_debt_amount)) /
                parseFloat(groupExpenseToUpdate.total_amount)
            ) * 100;
          const debtorsPercentage = groupExpenseToUpdate.participants.reduce(
            (acc, participant) => ({
              ...acc,
              [participant.debtor_id]:
                Math.round(
                  parseFloat(participant.debtor_amount) /
                    parseFloat(groupExpenseToUpdate.total_amount)
                ) * 100,
            }),
            {} as { [key: string]: number }
          );
          setPercentageShares({
            ...debtorsPercentage,
            [groupExpenseToUpdate.payer_id]: payerPercentage,
          });
        }
      }
      setGroupExpenseInfo({
        expense_name: groupExpenseToUpdate?.expense_name,
        total_amount: groupExpenseToUpdate?.total_amount,
        description: groupExpenseToUpdate.description ?? "",
        payer_id: groupExpenseToUpdate.payer_id,
        payer_share:
          parseFloat(groupExpenseToUpdate.total_amount) -
          parseFloat(groupExpenseToUpdate.total_debt_amount),
        split_type: groupExpenseToUpdate.split_type,
        receipt: null,
        debtors: groupExpenseToUpdate.participants.map((participant) => ({
          debtor_id: participant.debtor_id,
          debtor_share: parseFloat(participant.debtor_amount),
        })),
      });
      setGroupPayer(
        chatMembers?.find(
          (member) =>
            member.group_membership_id === groupExpenseToUpdate.payer_id
        )!
      );
      setSplitType(
        groupExpenseToUpdate.split_type as "EQUAL" | "UNEQUAL" | "PERCENTAGE"
      );
      setIsFormValid(true);
      const updatedBalanceAmount = updateBalance(
        chat.balance_amount,
        isCurrentMemberPayer
          ? parseFloat(groupExpenseToUpdate.total_amount) -
              parseFloat(groupExpenseToUpdate.total_debt_amount)
          : parseFloat(groupExpenseToUpdate.user_debt),
        groupExpenseToUpdate.payer_id !== currentMember?.group_membership_id
      );
      setChats((prev) => {
        const groupsChat = prev as GroupData[];
        return groupsChat.map((c) =>
          c.group_id === (chat as GroupData).group_id
            ? { ...c, balance_amount: updatedBalanceAmount }
            : c
        );
      });
    }
  };

  const resetForm = () => {
    setExpenseInfo({
      expense_name: "",
      total_amount: "",
      description: "",
      payer_id: user?.user_id,
      debtor_id: "",
      participant1_share: 0,
      participant2_share: 0,
      split_type: "EQUAL",
      receipt: null,
    });
    setGroupExpenseInfo({
      expense_name: "",
      total_amount: "",
      description: "",
      payer_id: currentMember?.group_membership_id,
      payer_share: 0,
      split_type: "EQUAL",
      receipt: null,
      debtors: [],
    });
    setErrors({
      expense_name: "",
      total_amount: "",
      description: "",
    });
    setEqualShares({});
    setUnequalShares({});
    setPercentageShares({});
    setPayer(user ?? null);
    setGroupPayer(currentMember ?? null);
    setSplitType("EQUAL");
    setIsFormValid(false);
  };

  const handleConfirm = () => {
    setOpenConfirm(false);
    handleAddExpensesClose();
    resetForm();
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  const handleBulkExpenseOpen = () => {
    setOpenBulkAddExpense(true);
    handleAddExpensesClose();
  }
  const onAddExpenseClose = () => {
    setOpenConfirm(true);
  };
  const handlePayerDialogOpen = () => {
    setPayerDialogOpen(true);
  };
  const handleSplitTypeOpen = () => {
    setSplitTypeOpen(true);
  };
  const handlePayerDialogClose = () => setPayerDialogOpen(false);
  const handleSplitTypeClose = () => setSplitTypeOpen(false);

  const validateFields = () => {
    let newFriendsErrors = {
      expense_name: "",
      total_amount: "",
      description: "",
    };
    let newGroupsErrors = {
      expense_name: "",
      total_amount: "",
      description: "",
    };
    if (isFriendsConversation(chat)) {
      if (!expenseInfo.expense_name.trim()) {
        newFriendsErrors.expense_name = "Expense name is required";
      } else {
        if (expenseInfo.expense_name.trim().length > 50) {
          newFriendsErrors.expense_name =
            "Expense name must not exceed 50 characters.";
        }
      }
      if (!expenseInfo.total_amount.trim()) {
        newFriendsErrors.total_amount = "Total amount is required";
      } else {
        const amount = parseFloat(expenseInfo.total_amount);
        if (isNaN(amount) || amount <= 0 || amount > 9999999999.99) {
          newFriendsErrors.total_amount =
            "Amount must be between 0.01 and 9,999,999,999.99";
        }
      }
      if (
        expenseInfo.description.trim() &&
        expenseInfo.description.trim().length > 150
      ) {
        newFriendsErrors.description =
          "Description must not exceed 150 characters.";
      }
      setErrors(newFriendsErrors);
      const formValid =
        !newFriendsErrors.expense_name && !newFriendsErrors.total_amount;
      setIsFormValid(formValid); // Store validation result in state
      return formValid;
    } else {
      if (!groupExpenseInfo.expense_name.trim()) {
        newGroupsErrors.expense_name = "Expense name is required";
      } else {
        if (groupExpenseInfo.expense_name.trim().length > 50) {
          newGroupsErrors.expense_name =
            "Expense name must not exceed 50 characters.";
        }
      }
      if (!groupExpenseInfo.total_amount.trim()) {
        newGroupsErrors.total_amount = "Total amount is required";
      } else {
        const amount = parseFloat(groupExpenseInfo.total_amount);
        if (isNaN(amount) || amount <= 0 || amount > 9999999999.99) {
          newGroupsErrors.total_amount =
            "Amount must be a number between 0.01 and 9,999,999,999.99";
        }
      }
      if (
        groupExpenseInfo.description.trim() &&
        groupExpenseInfo.description.trim().length > 150
      ) {
        newGroupsErrors.description =
          "Description must not exceed 150 characters.";
      }
      setErrors(newGroupsErrors);
      const formValid =
        !newGroupsErrors.expense_name && !newGroupsErrors.total_amount;
      setIsFormValid(formValid); // Store validation result in state
      return formValid;
    }
  };

  const onBlurValidation = () => validateFields();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (isFriendsConversation(chat)) {
      const getShareValue = (
        id: string,
        shares:
          | typeof equalShares
          | typeof unequalShares
          | typeof percentageShares
      ): number => {
        return shares[id] ?? 0;
      };
      const updatedExpenseInfo = {
        ...expenseInfo,
        payer_id: payer?.user_id,
        debtor_id: participants.find(
          (participant) => participant.user_id !== payer?.user_id
        )?.user_id!,
        split_type: splitType,
        participant1_share:
          splitType === "EQUAL"
            ? getShareValue(user?.user_id!, equalShares)
            : splitType === "UNEQUAL"
            ? getShareValue(user?.user_id!, unequalShares)
            : getShareValue(user?.user_id!, percentageShares),
        participant2_share:
          splitType === "EQUAL"
            ? getShareValue(chat.friend.user_id, equalShares)
            : splitType === "UNEQUAL"
            ? getShareValue(chat.friend.user_id, unequalShares)
            : getShareValue(chat.friend.user_id, percentageShares),
      };

      setExpenseInfo(updatedExpenseInfo);
      const formData = new FormData();
      Object.keys(updatedExpenseInfo).forEach((key) => {
        const value = updatedExpenseInfo[
          key as keyof typeof updatedExpenseInfo
        ] as unknown;

        if (value !== null && value !== undefined && value !== "") {
          if (key === "receipt" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      switch (title) {
        case "Add Expense": {
          try {
            const newExpense = await addExpense(chat.conversation_id, formData);
            newExpense.payer =
              newExpense.payer_id === user?.user_id
                ? getFullNameAndImage(user)
                : getFullNameAndImage(chat.friend);
            toast.success("Expense added successfully!");
            if (setExpenses) setExpenses((prev) => [...prev, newExpense]);
            setCombinedView((prev) => [
              ...prev,
              { ...newExpense, type: "expense" },
            ]);
            const updatedBalanceAmount = isUserPayer(user?.user_id!, newExpense.payer_id)
              ? (
                  parseFloat(chat.balance_amount) +
                  parseFloat(newExpense.debtor_amount)
                ).toFixed(2)
              : (
                  parseFloat(chat.balance_amount) -
                  parseFloat(newExpense.debtor_amount)
                ).toFixed(2);
            setChats((prev) => {
              const friendChats = prev as FriendData[];
              return friendChats.map((c) =>
                c.conversation_id === chat.conversation_id
                  ? { ...c, balance_amount: updatedBalanceAmount }
                  : c
              );
            });
            resetForm();
            handleAddExpensesClose();
          } catch (error) {
            toast.error("Something went wrong please try again later.");
          } finally {
            setIsSubmitting(false);
          }
          break;
        }
        case "Update Expense": {
          try {
            formData.append(
              "friend_expense_id",
              friendExpenseToUpdate?.friend_expense_id!
            );
            const updatedExpense = await updateExpense(
              chat.conversation_id,
              formData
            );
            updatedExpense.payer =
              updatedExpense.payer_id === user?.user_id
                ? getFullNameAndImage(user)
                : getFullNameAndImage(chat.friend);
            toast.success("Expense updated successfully!");
            if (setExpenses)
              setExpenses((prev) =>
                prev.map((expense) =>
                  expense.friend_expense_id === updatedExpense.friend_expense_id
                    ? updatedExpense
                    : expense
                )
              );
            if (setFriendExpensesView)
              setFriendExpensesView((prev) =>
                prev.map((expense) =>
                  expense.friend_expense_id === updatedExpense.friend_expense_id
                    ? updatedExpense
                    : expense
                )
              );
            setCombinedView((prev) =>
              prev.map((item) => {
                if (isCombinedExpense(item)) {
                  return item.friend_expense_id ===
                    updatedExpense.friend_expense_id
                    ? { ...updatedExpense, type: "expense" }
                    : item;
                }
                return item;
              })
            );
            const updatedBalanceAmount = updateBalance(
              chat.balance_amount,
              parseFloat(updatedExpense.debtor_amount),
              updatedExpense.payer_id === user?.user_id
            );
            setChats((prev) => {
              const friendChats = prev as FriendData[];
              return friendChats.map((c) =>
                c.conversation_id === chat.conversation_id
                  ? { ...c, balance_amount: updatedBalanceAmount }
                  : c
              );
            });
            resetForm();
            handleAddExpensesClose();
          } catch (error) {
            toast.error("Something went wrong please try again later.");
          } finally {
            setIsSubmitting(false);
          }
        }
      }
    } else {
      const updatedGroupExpenseInfo = {
        ...groupExpenseInfo,
        payer_id: groupPayer?.group_membership_id,
        split_type: splitType,
        payer_share:
          splitType === "EQUAL"
            ? equalShares[groupPayer?.group_membership_id!]
            : splitType === "UNEQUAL"
            ? unequalShares[groupPayer?.group_membership_id!]
            : percentageShares[groupPayer?.group_membership_id!],
        debtors:
          splitType === "EQUAL"
            ? Object.entries(equalShares)
                .filter(([, value]) => value !== 0)
                .filter(([key]) => key !== groupPayer?.group_membership_id)
                .map(([key, value]) => ({
                  debtor_id: key,
                  debtor_share: value,
                }))
            : splitType === "UNEQUAL"
            ? Object.entries(unequalShares)
                .filter(([, value]) => value !== 0)
                .filter(([key]) => key !== groupPayer?.group_membership_id)
                .map(([key, value]) => ({
                  debtor_id: key,
                  debtor_share: value,
                }))
            : Object.entries(percentageShares)
                .filter(([, value]) => value !== 0)
                .filter(([key]) => key !== groupPayer?.group_membership_id)
                .map(([key, value]) => ({
                  debtor_id: key,
                  debtor_share: value,
                })),
      };
      setGroupExpenseInfo(updatedGroupExpenseInfo);
      const formData = new FormData();
      Object.keys(updatedGroupExpenseInfo).forEach((key) => {
        const value = updatedGroupExpenseInfo[
          key as keyof typeof updatedGroupExpenseInfo
        ] as unknown;

        if (value !== null && value !== undefined && value !== "") {
          if (key === "receipt" && value instanceof File) {
            formData.append(key, value);
          } else if (key === "debtors") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      switch (title) {
        case "Add Expense": {
          try {
            const newExpense = await addGroupExpense(chat.group_id, formData);
            const expenseData = newExpense.expense;
            const expenseParticipants = newExpense.expenseParticipants;
            const totalDebtAmount = expenseParticipants.reduce(
              (acc, val) => acc + parseFloat(val.debtor_amount),
              0
            );
            expenseData.total_debt_amount = totalDebtAmount.toFixed(2);
            expenseData.participants = expenseParticipants;
            if (expenseData.payer_id === currentMember?.group_membership_id) {
              expenseData.payer = getFullNameAndImage(currentMember);
              expenseData.user_debt = (
                parseFloat(expenseData.total_amount) - totalDebtAmount
              ).toFixed(2);
            } else {
              const payer = chatMembers!.find(
                (member) => expenseData.payer_id === member.group_membership_id
              );
              expenseData.payer = getFullNameAndImage(payer);
              expenseData.user_debt = expenseParticipants.find(
                (participant) =>
                  participant.debtor_id === currentMember?.group_membership_id
              )!.debtor_amount;
            }
            toast.success("Expense added successfully!");
            setGroupExpenses &&
              setGroupExpenses((prev) => [...prev, expenseData]);
            setCombinedView((prev) => [
              ...prev,
              { ...expenseData, type: "expense" },
            ]);
            const updatedBalanceAmount =
              groupPayer?.group_membership_id ===
              currentMember?.group_membership_id
                ? (
                    parseFloat(chat!.balance_amount) +
                    parseFloat(newExpense.expense.total_debt_amount)
                  ).toFixed(2)
                : (
                    parseFloat(chat!.balance_amount) -
                    parseFloat(newExpense.expense.user_debt)
                  ).toFixed(2);
            setChats((prev) => {
              const groupChats = prev as GroupData[];
              return groupChats.map((c) =>
                c.group_id === chat?.group_id
                  ? { ...c, balance_amount: updatedBalanceAmount }
                  : c
              );
            });
            resetForm();
            handleAddExpensesClose();
          } catch (error) {
            toast.error("Something went wrong please try again later.");
          } finally {
            setIsSubmitting(false);
          }
          break;
        }
        case "Update Expense": {
          if (!groupExpenseToUpdate) return;
          if (!isGroupExpense(groupExpenseToUpdate)) return;
          formData.append(
            "group_expense_id",
            groupExpenseToUpdate?.group_expense_id!
          );
          try {
            const updatedExpense = await updateGroupExpense(
              chat.group_id,
              formData
            );
            const expenseData = updatedExpense.expense;
            const expenseParticipants = updatedExpense.expenseParticipants;
            const totalDebtAmount = expenseParticipants.reduce(
              (acc, val) => acc + parseFloat(val.debtor_amount),
              0
            );
            expenseData.total_debt_amount = totalDebtAmount.toFixed(2);
            expenseData.participants = expenseParticipants;
            if (expenseData.payer_id === currentMember?.group_membership_id) {
              expenseData.payer = getFullNameAndImage(currentMember);
              expenseData.user_debt = (
                parseFloat(expenseData.total_amount) - totalDebtAmount
              ).toFixed(2);
            } else {
              const payer = chatMembers!.find(
                (member) => expenseData.payer_id === member.group_membership_id
              );
              expenseData.payer = getFullNameAndImage(payer);
              expenseData.user_debt = expenseParticipants.find(
                (participant) =>
                  participant.debtor_id === currentMember?.group_membership_id
              )!.debtor_amount;
            }
            toast.success("Expense updated successfully!");
            setGroupExpenses &&
              setGroupExpenses((prev) =>
                prev.map((expense) =>
                  isGroupExpense(expense) &&
                  expense.group_expense_id === expenseData.group_expense_id
                    ? expenseData
                    : expense
                )
              );
            setGroupExpensesView &&
              setGroupExpensesView((prev) =>
                prev.map((expense) =>
                  isGroupExpense(expense) &&
                  expense.group_expense_id === expenseData.group_expense_id
                    ? expenseData
                    : expense
                )
              );
            setCombinedView((prev) =>
              prev.map((item) =>
                isCombinedGroupExpense(item) &&
                item.group_expense_id === expenseData.group_expense_id
                  ? { ...expenseData, type: "expense" }
                  : item
              )
            );
            const updatedBalanceAmount = updateBalance(
              chat.balance_amount,
              isCurrentMemberPayer
                ? parseFloat(groupExpenseToUpdate.total_amount) -
                    parseFloat(groupExpenseToUpdate.total_debt_amount)
                : parseFloat(groupExpenseToUpdate.user_debt),
              groupExpenseToUpdate.payer_id ===
                currentMember?.group_membership_id
            );
            setChats((prev) => {
              const groupChats = prev as GroupData[];
              return groupChats.map((c) =>
                c.group_id === chat?.group_id
                  ? { ...c, balance_amount: updatedBalanceAmount }
                  : c
              );
            });
            resetForm();
            handleAddExpensesClose();
          } catch (error) {
            toast.error("Something went wrong please try again later.");
          } finally {
            setIsSubmitting(false);
          }
          break;
        }
      }
    }
  };
  
  const onChange = (key: string, value: string | number) =>
    isFriendsConversation(chat)
      ? setExpenseInfo((prev) => ({ ...prev, [key]: value }))
      : setGroupExpenseInfo((prev) => ({ ...prev, [key]: value }));
  return (
    <>
      <ConfirmDialog
        open={openConfirm}
        title={`Close ${title}`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <SplitType
        open={splitTypeOpen}
        chat={chat}
        participants={isFriendsConversation(chat) ? participants : undefined}
        groupParticipants={
          isFriendsConversation(chat) ? undefined : groupParticipants
        }
        selectedGroupParticipants={selectedGroupParticipants}
        setSelectedGroupParticipants={setSelectedGroupParticipants}
        totalAmount={
          isFriendsConversation(chat)
            ? parseFloat(expenseInfo.total_amount)
            : parseFloat(groupExpenseInfo.total_amount)
        }
        handleSplitTypeClose={handleSplitTypeClose}
        splitType={splitType}
        setSplitType={setSplitType}
        equalShares={equalShares}
        setEqualShares={setEqualShares}
        unequalShares={unequalShares}
        setUnequalShares={setUnequalShares}
        percentageShares={percentageShares}
        setPercentageShares={setPercentageShares}
        isUpdateMode={title === "Update Expense"}
        groupExpenseToUpdate={
          groupExpenseToUpdate && isGroupExpense(groupExpenseToUpdate)
            ? groupExpenseToUpdate
            : undefined
        }
      />
      <Payer
        open={payerDialogOpen}
        chat={chat}
        participants={isFriendsConversation(chat) ? participants : undefined}
        groupParticipants={
          isFriendsConversation(chat) ? undefined : groupParticipants
        }
        handlePayerDialogClose={handlePayerDialogClose}
        payer={isFriendsConversation(chat) ? payer! : undefined}
        groupPayer={isFriendsConversation(chat) ? undefined : groupPayer!}
        setPayer={isFriendsConversation(chat) ? setPayer : undefined}
        setGroupPayer={isFriendsConversation(chat) ? undefined : setGroupPayer}
      />
      <BulkInsert
        open={openBulkAddExpense}
        chat={chat}
        onCancel={() => setOpenBulkAddExpense(false)}
        onAddedExpenses={handleAddedExpenses}
        onSwitchToSingle={() => {setOpenBulkAddExpense(false); setOpen && setOpen(true)}}
      />
      <Modal open={open} onClose={handleAddExpensesClose}>
        <motion.div
          initial={{ x: 0 }}
          animate={payerDialogOpen || splitTypeOpen ? { x: -200 } : { x: 0 }} // Slide to the left when second modal opens
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            height: "100%",
            zIndex: 10,
            pointerEvents: payerDialogOpen || splitTypeOpen ? "none" : "auto",
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
            {/* <ModalClose onClick={() => handleViewExpensesClose()} /> */}
            <DialogTitle
              className="bg-[#3674B5] text-center text-white"
              sx={{ borderRadius: "7px 7px 0px 0px" }}
            >
              {title}
            </DialogTitle>
            <Box className="rounded bg-[white] flex flex-col gap-3 p-3">
              <TextField
                label="Expense Name"
                required
                variant="outlined"
                name="expense_name"
                value={
                  isFriendsConversation(chat)
                    ? expenseInfo.expense_name
                    : groupExpenseInfo.expense_name
                }
                onChange={(e) => onChange("expense_name", e.target.value)}
                onBlur={onBlurValidation}
                fullWidth
                error={!!errors.expense_name}
                helperText={errors.expense_name}
              />

              <TextField
                label="Total Amount"
                required
                variant="outlined"
                name="total_amount"
                value={
                  isFriendsConversation(chat)
                    ? expenseInfo.total_amount
                    : groupExpenseInfo.total_amount
                }
                onChange={(e) => onChange("total_amount", e.target.value)}
                onBlur={onBlurValidation}
                fullWidth
                error={!!errors.total_amount}
                helperText={errors.total_amount}
              />
              <TextField
                label="Description"
                variant="outlined"
                name="description"
                value={
                  isFriendsConversation(chat)
                    ? expenseInfo.description
                    : groupExpenseInfo.description
                }
                onChange={(e) => onChange("description", e.target.value)}
                onBlur={onBlurValidation}
                fullWidth
                error={!!errors.description}
                helperText={errors.description}
              />
              <Box className="rounded-lg flex justify-center items-center gap-2">
                <Typography>Paid by</Typography>
                <Button
                  sx={{ borderRadius: "50px" }}
                  onClick={handlePayerDialogOpen}
                  variant="outlined"
                  disabled={!isFormValid}
                >
                  {isFriendsConversation(chat)
                    ? payer?.user_id === user?.user_id
                      ? "you"
                      : `${payer?.first_name} ${payer?.last_name || ""}`.trim()
                    : groupPayer?.group_membership_id ===
                      currentMember?.group_membership_id
                    ? "you"
                    : `${groupPayer?.first_name} ${
                        groupPayer?.last_name || ""
                      }`.trim()}
                </Button>
                <Typography>and split</Typography>
                <Button
                  sx={{ borderRadius: "50px" }}
                  onClick={handleSplitTypeOpen}
                  variant="outlined"
                  disabled={!isFormValid}
                >
                  {splitType}
                </Button>
              </Box>
              <Button
                component="label"
                role={undefined}
                tabIndex={-1}
                variant="outlined"
                color="neutral"
                startDecorator={
                  <SvgIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </SvgIcon>
                }
              >
                Upload Receipt
                <VisuallyHiddenInput type="file" />
              </Button>
              <Box
                className={`flex items-center ${
                  isFriendsConversation(chat) && title === "Add Expense"
                    ? "justify-between"
                    : "justify-end"
                }`}
              >
                {(isFriendsConversation(chat) && title === "Add Expense") && (
                  <Button onClick={handleBulkExpenseOpen}>Bulk Insertion of Expenses</Button>
                )}
                <Box className="flex gap-3">
                  <Button onClick={onAddExpenseClose}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!isFormValid}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">Saving...</span>
                        <CircularProgress size={20} />
                      </>
                    ) : (
                      (title === "Add Expense" ? "Add" : "Update") + " Expense"
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </ModalDialog>
        </motion.div>
      </Modal>
    </>
  );
};

export default AddExpense;
