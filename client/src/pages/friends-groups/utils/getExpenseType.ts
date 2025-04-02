export const isFriendsExpense = (
  item: ExpenseData | GroupExpenseData
): item is ExpenseData => {
  return (item as ExpenseData).conversation_id !== undefined;
};

export const isGroupExpense = (
  item: GroupExpenseData | GroupSettlementData
): item is GroupExpenseData => {
  return (item as GroupExpenseData).group_expense_id !== undefined;
};
