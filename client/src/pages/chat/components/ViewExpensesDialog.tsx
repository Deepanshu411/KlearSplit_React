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
import { deleteExpense, fetchExpenses } from "../friends/services";

interface ViewExpensesDialogProps {
  friend: FriendData | null;
  open: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(date);
};

const ViewExpensesDialog: React.FC<ViewExpensesDialogProps> = ({
  friend,
  open,
  onClose,
}) => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchExpenses(friend?.conversation_id!)
        .then((data) => setExpenses(data))
        .catch(() => toast.error("Failed to load expenses"))
        .finally(() => setLoading(false));
    }
  }, [open, friend?.conversation_id!]);

  const handleDelete = async (conversationId: string, expenseId: string) => {
    setDeleteLoader(expenseId);
    try {
      await deleteExpense(conversationId, expenseId);
      setExpenses((prev) => prev.filter((e) => e.friend_expense_id !== expenseId));
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
                {expenses.map((expense) => (
                  <TableRow key={expense.friend_expense_id}>
                    <TableCell>{formatDate(expense.createdAt)}</TableCell>
                    <TableCell>{expense.expense_name}</TableCell>
                    <TableCell>₹{expense.total_amount}</TableCell>
                    <TableCell>{expense.payer}</TableCell>
                    <TableCell>{expense.split_type}</TableCell>
                    <TableCell>₹{expense.debtor_amount}</TableCell>
                    <TableCell>{expense.description || "--"}</TableCell>
                    <TableCell className="flex flex-row">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(friend?.conversation_id!, expense.friend_expense_id)}
                        disabled={!!deleteLoader}
                      >
                        {deleteLoader === expense.friend_expense_id ? <CircularProgress size={20} /> : <Delete />}
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
