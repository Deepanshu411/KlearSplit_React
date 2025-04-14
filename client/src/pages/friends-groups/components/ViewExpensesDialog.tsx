import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Delete, Edit, Download } from "@mui/icons-material";
import { toast } from "sonner";
import { deleteExpense, fetchAllExpenses } from "../friends/services";
import isUserPayer from "../utils/getGroupPayer";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { deleteExpenseAndSettlement, fetchAllExpensesAndSettlements } from "../groups/services";
import { isGroupExpense } from "../utils/getExpenseType";
import isFriendsConversation from "../utils/getConversationType";
import getFullNameAndImage from "../utils/getFullNameAndImage";

interface ViewExpensesDialogProps {
  chat: FriendData | GroupData | null;
  open: boolean;
  onClose: () => void;
  groupMembers?: GroupMemberData[];
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
  open,
  onClose,
  groupMembers
}) => {
  const user = useSelector((store: RootState) => store.auth.user);
  const [friendExpenses, setFriendExpenses] = useState<ExpenseData[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<
    (GroupExpenseData | GroupSettlementData)[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState<string | null>(null);

  useEffect(() => {
    const getAllExpenses = async () => {
      if (!open || !chat) return; 
      setLoading(true);
      try {
        if (isFriendsConversation(chat)) {
          const data = await fetchAllExpenses(
            chat?.conversation_id!
          );
          setFriendExpenses(data);
          setGroupExpenses([]); // Reset group expenses
        } else {
          const data = await fetchAllExpensesAndSettlements(
            chat?.group_id!
          );
          const expensesWithPayer = data.map((expense) => {
            const payer = groupMembers?.find((member) => expense.payer_id === member.group_membership_id);
            return { ...expense, payer: getFullNameAndImage(payer) }
          })
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
  }, [open, (chat as FriendData)?.conversation_id!]);

  const handleDelete = async (conversationId: string, expenseId: string) => {
    setDeleteLoader(expenseId);
    try {
      await deleteExpense(conversationId, expenseId);
      setFriendExpenses((prev) =>
        prev.filter((e) => e.friend_expense_id !== expenseId)
      );
      toast.success("Expense deleted successfully");
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeleteLoader(null);
    }
  };
  
  const handleGroupExpenseDelete = async (conversationId: string, expenseId: string, isExpense: boolean) => {
    setDeleteLoader(expenseId);
    try {
      await deleteExpenseAndSettlement(conversationId, isExpense, expenseId);
      setGroupExpenses((prev) =>
        prev.filter((e) => isGroupExpense(e) ? e.group_expense_id !== expenseId : e.group_settlement_id !== expenseId)
      );
      toast.success("Expense deleted successfully");
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeleteLoader(null);
    }
  };

  return (
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
                {isFriendsConversation(chat!) ? friendExpenses.map((expense) => (
                  <TableRow
                    key={
                      expense.friend_expense_id
                    }
                  >
                    <TableCell>{formatDate(expense.createdAt)}</TableCell>
                    <TableCell>{expense.expense_name}</TableCell>
                    <TableCell>₹{expense.total_amount}</TableCell>
                    <TableCell>
                      {expense.payer.fullName}
                    </TableCell>
                    <TableCell>{expense.split_type}</TableCell>
                    <TableCell>
                      ₹{expense.debtor_amount}
                    </TableCell>
                    <TableCell>{expense.description || "--"}</TableCell>
                    <TableCell className="flex flex-row">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDelete(
                            (chat as FriendData)?.conversation_id!,
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
                    </TableCell>
                  </TableRow>
                )) : groupExpenses.map((expense) => (
                  <TableRow
                    key={
                      isGroupExpense(expense) ? expense.group_expense_id : expense.group_settlement_id
                    }
                  >
                    <TableCell>{formatDate(expense.createdAt)}</TableCell>
                    <TableCell>{isGroupExpense(expense) ? expense.expense_name : "Settlement"}</TableCell>
                    <TableCell>₹{isGroupExpense(expense) ? expense.total_amount : expense.settlement_amount}</TableCell>
                    <TableCell>
                      {expense.payer.fullName}
                    </TableCell>
                    <TableCell>{isGroupExpense(expense) ? expense.split_type: "--"}</TableCell>
                    <TableCell>
                      ₹{isGroupExpense(expense) ? isUserPayer(user?.user_id!, expense.payer_id) ? expense.total_debt_amount : expense.user_debt : expense.settlement_amount}
                    </TableCell>
                    <TableCell>{expense.description || "--"}</TableCell>
                    <TableCell className="flex flex-row">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleGroupExpenseDelete(
                            (chat as GroupData)?.group_id!,
                            isGroupExpense(expense) ? expense.group_expense_id : expense.group_settlement_id,
                            isGroupExpense(expense),
                          )
                        }
                        disabled={!!deleteLoader}
                      >
                        {deleteLoader === (isGroupExpense(expense) ? expense.group_expense_id : expense.group_settlement_id) ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Delete />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions className="p-4 flex justify-between">
        <IconButton>
          <Download />
        </IconButton>
        <Button onClick={onClose} color="error" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewExpensesDialog;
