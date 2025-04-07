import API_URLS from "../../../constants/apis/urls";
import axiosInstance from "../../../services/axiosInterceptor";

export const getGroups = async () => {
  const response = await axiosInstance.get<Groups>(API_URLS.groups.getGroups);
  return response.data.data;
};

export const createGroup = async (
  groupData: CreateGroupData | FormData,
): Promise<Group> => {
  const response = await axiosInstance.post<CreateGroupResponse>(
    `${API_URLS.groups.createGroup}`,
    groupData,
  );
  return response.data.data;
}

export const fetchGroupMembers = async (groupId: string) => {
    const response = await axiosInstance.get<GroupResponse>(
      `${API_URLS.groups.group}/${groupId}`,
    );
    return response.data.data;
  }

export const blockGroup = async (groupId: string, blockStatus: boolean) => {
  const response = await axiosInstance.patch<UpdateMemberResponse>(
    `${API_URLS.groups.updateGroupMember}/${groupId}`,
    { has_blocked: blockStatus }
  );
  return response.data.data;
};

export const fetchAllExpensesAndSettlements = async (groupId: string) => {
  const params = { fetchAll: true, timestamp: new Date().toISOString() };

  const response = await axiosInstance.get<FetchExpenseResponse>(
    `${API_URLS.groups.fetchExpensesSettlements}/${groupId}`,
    {
      params,
    }
  );
  return response.data.data;
};

export const deleteExpenseAndSettlement = async(groupId: string, isExpense: boolean, id: string) => {
    const url = isExpense ? API_URLS.groups.deleteGroupExpense : API_URLS.groups.deleteGroupSettlement;
    const body = isExpense ? { group_expense_id: id } : { group_settlement_id: id };
    const response = await axiosInstance.delete(`${url}/${groupId}`, { data: body });
    return response.data.data;
  }

// export const fetchExpenses = async (conversationId: string) => {
//     const response = await axiosInstance.get(`${API_URLS.friends.getExpenses}/${conversationId}`, {params: {fetchAll: true, timestamp: new Date().toISOString()}});
//     return response.data.data;
// }

// export const deleteExpense = async (conversationId: string, expenseId: string) => {
//     const response = await axiosInstance.delete(`${API_URLS.friends.deleteExpense}/${conversationId}`, { data: { "friend_expense_id": expenseId } });
//     return response.data.data;
// }
