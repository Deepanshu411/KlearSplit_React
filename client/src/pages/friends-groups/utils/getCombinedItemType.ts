export type CombinedViewType =
| CombinedMessage
| CombinedExpense
| CombinedGroupMessage
| CombinedGroupExpense
| CombinedGroupSettlement;

export const isCombinedExpense = (
  item: CombinedViewType
): item is CombinedExpense => {
  return (item as CombinedExpense).friend_expense_id !== undefined;
};

export const isCombinedGroupExpense = (
  item: CombinedViewType
): item is CombinedGroupExpense => {
  return (item as CombinedGroupExpense).group_expense_id !== undefined;
};

export const isCombinedGroupSettlement = (
  item: CombinedViewType
): item is CombinedGroupSettlement => {
  return (item as CombinedGroupSettlement).group_settlement_id !== undefined;
};

export const isCombinedGroupMessage = (item: CombinedViewType): item is CombinedGroupMessage => {
  return (item as CombinedGroupMessage).group_message_id !== undefined;
};

export const isCombinedMessage = (item: CombinedViewType): item is CombinedMessage => {
  return (item as CombinedMessage).message_id !== undefined;
};
