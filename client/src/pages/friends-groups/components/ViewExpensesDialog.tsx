import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import { Delete, Edit, Download } from "@mui/icons-material";
import { toast } from "sonner";
import { deleteExpense, fetchAllExpenses } from "../friends/services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import isUserPayer from "../utils/getGroupPayer";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  deleteExpenseAndSettlement,
  fetchAllExpensesAndSettlements,
} from "../groups/services";
import { isGroupExpense } from "../utils/getExpenseType";
import isFriendsConversation from "../utils/getConversationType";
import getFullNameAndImage from "../utils/getFullNameAndImage";
import AddExpense from "./AddExpense";

interface ViewExpensesDialogProps {
  chat: FriendData | GroupData;
  setChats: React.Dispatch<React.SetStateAction<FriendData[] | GroupData[]>>;
  open: boolean;
  onClose: () => void;
  groupMembers?: GroupMemberData[];
  currentMember?: GroupMemberData;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(date);
};

const ViewExpensesDialog: React.FC<ViewExpensesDialogProps> = ({
  chat,
  setChats,
  open,
  onClose,
  groupMembers,
  currentMember,
  setCombinedView,
}) => {
  const user = useSelector((store: RootState) => store.auth.user);
  const [friendExpenses, setFriendExpenses] = useState<ExpenseData[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<
    (GroupExpenseData | GroupSettlementData)[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState<string | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);

  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);

  useEffect(() => {
    const getAllExpenses = async () => {
      if (!open || !chat) return;
      setLoading(true);
      try {
        if (isFriendsConversation(chat)) {
          const data = await fetchAllExpenses(chat?.conversation_id!);
          const expensesWithPayer = data.map((expense) => {
            expense.payer =
              expense.payer_id === user?.user_id
                ? getFullNameAndImage(user)
                : getFullNameAndImage(chat.friend);
            return expense;
          });
          setFriendExpenses(expensesWithPayer);
          setGroupExpenses([]); // Reset group expenses
        } else {
          const data = await fetchAllExpensesAndSettlements(chat?.group_id!);
          const expensesWithPayer = data.map((expense) => {
            const payer = groupMembers?.find(
              (member) => expense.payer_id === member.group_membership_id
            );
            return { ...expense, payer: getFullNameAndImage(payer) };
          });
          setGroupExpenses(expensesWithPayer);
          setFriendExpenses([]); // Reset friend expenses
        }
      } catch (error) {
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };
    getAllExpenses();
  }, [open, chat]);

  const handleDelete = async (conversationId: string, expenseId: string) => {
    setDeleteLoader(expenseId);
    try {
      await deleteExpense(conversationId, expenseId);
      const expenseToBeDeleted = friendExpenses.find(
        (expense) => expense.friend_expense_id === expenseId
      );
      setFriendExpenses((prev) =>
        prev.filter((e) => e.friend_expense_id !== expenseId)
      );
      const updatedBalanceAmount =
        expenseToBeDeleted?.payer_id === user?.user_id
          ? (
              parseFloat(chat.balance_amount) -
              parseFloat(expenseToBeDeleted?.debtor_amount!)
            ).toFixed(2)
          : (
              parseFloat(chat.balance_amount) +
              parseFloat(expenseToBeDeleted?.debtor_amount!)
            ).toFixed(2);
      setChats((prev) => {
        const friendChats = prev as FriendData[];
        return friendChats.map((c) =>
          c.conversation_id === (chat as FriendData).conversation_id
            ? { ...c, balance_amount: updatedBalanceAmount }
            : c
        );
      });
      toast.success("Expense deleted successfully");
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeleteLoader(null);
    }
  };

  const handleGroupExpenseDelete = async (
    groupId: string,
    expenseId: string,
    isExpense: boolean
  ) => {
    setDeleteLoader(expenseId);
    try {
      await deleteExpenseAndSettlement(groupId, isExpense, expenseId);
      const expenseToBeDeleted = groupExpenses.find((expense) =>
        isGroupExpense(expense)
          ? expense.group_expense_id === expenseId
          : expense.group_settlement_id === expenseId
      );
      setGroupExpenses((prev) =>
        prev.filter((e) =>
          isGroupExpense(e)
            ? e.group_expense_id !== expenseId
            : e.group_settlement_id !== expenseId
        )
      );
      const updatedBalanceAmount =
        expenseToBeDeleted?.payer_id === currentMember?.group_membership_id
          ? (
              parseFloat(chat.balance_amount) -
              parseFloat(
                isGroupExpense(expenseToBeDeleted!)
                  ? expenseToBeDeleted.total_debt_amount
                  : expenseToBeDeleted?.settlement_amount!
              )
            ).toFixed(2)
          : (
              parseFloat(chat.balance_amount) +
              parseFloat(
                isGroupExpense(expenseToBeDeleted!)
                  ? expenseToBeDeleted.user_debt
                  : expenseToBeDeleted?.settlement_amount!
              )
            ).toFixed(2);
      setChats((prev) => {
        const groupChats = prev as GroupData[];
        return groupChats.map((c) =>
          c.group_id === (chat as GroupData).group_id
            ? { ...c, balance_amount: updatedBalanceAmount }
            : c
        );
      });
      toast.success("Expense deleted successfully");
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeleteLoader(null);
    }
  };

  const handleDownloadExpenses = () => {
    if (isFriendsConversation(chat!)) {
      const doc = new jsPDF();

      // Define the columns for the table (these will be used as headers)
      const columns = [
        { header: "Date", dataKey: "date" },
        { header: "Expense Name", dataKey: "name" },
        { header: "Total Amount", dataKey: "amount" },
        { header: "Payer Name", dataKey: "payer" },
        { header: "Split Type", dataKey: "splitType" },
        { header: "Debt Amount", dataKey: "debtAmount" },
        { header: "Description", dataKey: "description" },
      ];

      // Map through the totalExpenses and transform the data into a format compatible with the table
      const extractedExpense = friendExpenses.map((expense) => ({
        date: formatDate(expense.createdAt),
        name: expense.expense_name,
        amount: expense.total_amount,
        payer:
          typeof expense.payer === "object"
            ? expense.payer.fullName
            : expense.payer,
        splitType: expense.split_type,
        debtAmount: expense.debtor_amount,
        description: expense.description,
      }));

      // Convert the array of objects (expenses) into array of arrays for the autoTable body
      const body = extractedExpense.map((expense) => Object.values(expense));

      // Generate the table in the PDF using the autoTable
      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body,
      });

      // Save the generated PDF with the filename 'expense_report.pdf'
      doc.save("expense_report.pdf");
    } else {
      const doc = new jsPDF();

      // Define the columns for the table (these will be used as headers)
      const columns = [
        { header: "Date", dataKey: "date" },
        { header: "Expense Name", dataKey: "name" },
        { header: "Total Amount", dataKey: "amount" },
        { header: "Payer Name", dataKey: "payer" },
        { header: "Split Type", dataKey: "splitType" },
        { header: "Debt Amount", dataKey: "debtAmount" },
        { header: "Description", dataKey: "description" },
      ];

      // Map through the totalExpenses and transform the data into a format compatible with the table
      const extractedExpense = groupExpenses.map((expense) => {
        if (isGroupExpense(expense)) {
          return {
            date: formatDate(expense.createdAt),
            name: expense.expense_name,
            amount: expense.total_amount,
            payer:
              typeof expense.payer === "object"
                ? expense.payer.fullName
                : expense.payer,
            splitType: expense.split_type,
            debtAmount: expense.total_debt_amount,
            description: expense.description ?? "--",
          };
        }
        return {
          date: formatDate(expense.createdAt),
          name: "Settlement",
          amount: expense.settlement_amount,
          payer: expense.payer.fullName,
          splitType: "--",
          debtAmount: expense.settlement_amount,
          description: expense.description ?? "--",
        };
      });

      // Convert the array of objects (expenses) into array of arrays for the autoTable body
      const body = extractedExpense.map((expense) => Object.values(expense));

      // Generate the table in the PDF using the autoTable
      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body,
      });

      // Save the generated PDF with the filename 'group_expense_report.pdf'
      doc.save("group_expense_report.pdf");
    }
  };

  return (
    <>
      <AddExpense
        title="Update Expense"
        open={addExpenseDialogOpen}
        chat={chat}
        handleAddExpensesClose={handleAddExpensesClose}
        setChats={setChats}
        chatMembers={groupMembers}
        currentMember={currentMember}
        setCombinedView={setCombinedView}
      />
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle className="bg-blue-600 text-white text-center py-3">
          Expenses
        </DialogTitle>
        <DialogContent className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <CircularProgress />
            </div>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead className="bg-gray-100">
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Expense Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payer</TableCell>
                    <TableCell>Split Type</TableCell>
                    <TableCell>Debt</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isFriendsConversation(chat!)
                    ? friendExpenses.map((expense) => (
                        <TableRow key={expense.friend_expense_id}>
                          <TableCell>{formatDate(expense.createdAt)}</TableCell>
                          <TableCell>{expense.expense_name}</TableCell>
                          <TableCell>₹{expense.total_amount}</TableCell>
                          <TableCell>{expense.payer.fullName}</TableCell>
                          <TableCell>{expense.split_type}</TableCell>
                          <TableCell>₹{expense.debtor_amount}</TableCell>
                          <TableCell>{expense.description || "--"}</TableCell>
                          <TableCell className="flex flex-row">
                            <Tooltip title="Edit" placement="top">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleAddExpensesOpen}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDelete(
                                    chat?.conversation_id!,
                                    expense.friend_expense_id
                                  )
                                }
                                disabled={!!deleteLoader}
                              >
                                {deleteLoader === expense.friend_expense_id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <Delete />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    : groupExpenses.map((expense) => (
                        <TableRow
                          key={
                            isGroupExpense(expense)
                              ? expense.group_expense_id
                              : expense.group_settlement_id
                          }
                        >
                          <TableCell>{formatDate(expense.createdAt)}</TableCell>
                          <TableCell>
                            {isGroupExpense(expense)
                              ? expense.expense_name
                              : "Settlement"}
                          </TableCell>
                          <TableCell>
                            ₹
                            {isGroupExpense(expense)
                              ? expense.total_amount
                              : expense.settlement_amount}
                          </TableCell>
                          <TableCell>{expense.payer.fullName}</TableCell>
                          <TableCell>
                            {isGroupExpense(expense)
                              ? expense.split_type
                              : "--"}
                          </TableCell>
                          <TableCell>
                            ₹
                            {isGroupExpense(expense)
                              ? isUserPayer(user?.user_id!, expense.payer_id)
                                ? expense.total_debt_amount
                                : expense.user_debt
                              : expense.settlement_amount}
                          </TableCell>
                          <TableCell>{expense.description || "--"}</TableCell>
                          <TableCell className="flex flex-row">
                            <Tooltip title="Edit" placement="top">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleAddExpensesOpen}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleGroupExpenseDelete(
                                    (chat as GroupData)?.group_id!,
                                    isGroupExpense(expense)
                                      ? expense.group_expense_id
                                      : expense.group_settlement_id,
                                    isGroupExpense(expense)
                                  )
                                }
                                disabled={!!deleteLoader}
                              >
                                {deleteLoader ===
                                (isGroupExpense(expense)
                                  ? expense.group_expense_id
                                  : expense.group_settlement_id) ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <Delete />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions className="p-4 flex justify-between">
          <Tooltip title="Download PDF" placement="top">
            <IconButton onClick={handleDownloadExpenses}>
              <Download />
            </IconButton>
          </Tooltip>
          <Button onClick={onClose} color="error" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewExpensesDialog;
