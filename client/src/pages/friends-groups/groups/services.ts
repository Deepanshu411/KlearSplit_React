import { toast } from "sonner";
import API_URLS from "../../../constants/apis/urls";
import axiosInstance from "../../../services/axiosInterceptor";

const sortByCreatedAt = (data: (
  | CombinedGroupMessage
  | CombinedGroupExpense
  | CombinedGroupSettlement)[]) => {
  return data.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
};

export const getGroups = async () => {
  const response = await axiosInstance.get<Groups>(API_URLS.groups.getGroups);
  return response.data.data;
};

export const createGroup = async (
  groupData: CreateGroupData | FormData
): Promise<Group> => {
  const response = await axiosInstance.post<CreateGroupResponse>(
    `${API_URLS.groups.createGroup}`,
    groupData
  );
  return response.data.data;
};

export const addGroupMembers = async (membersData: MembersData, groupId: string) => {
  const response = await axiosInstance.post<AddMemberResponse>(
    API_URLS.groups.addGroupMembers,
    { membersData, group_id: groupId },
  );
  return response.data.data;
}

export const acceptRejectInvite = async (groupId: string, status: string) => {
  const response = await axiosInstance.patch(
    `${API_URLS.groups.updateGroupMember}/${groupId}`,
    { status },
  );
  return response.data.data;
};

export const fetchGroupMembers = async (groupId: string) => {
  const response = await axiosInstance.get<GroupResponse>(
    `${API_URLS.groups.group}/${groupId}`
  );
  return response.data.data;
};

export const updateGroup = async (groupId: string, groupData: FormData) => {
  const response = await axiosInstance.patch<UpdateGroupResponse>(
    `${API_URLS.groups.group}/${groupId}`,
    groupData,
  );
  return response.data.data;
};

export const blockGroup = async (groupId: string, blockStatus: boolean) => {
  const response = await axiosInstance.patch<UpdateMemberResponse>(
    `${API_URLS.groups.updateGroupMember}/${groupId}`,
    { has_blocked: blockStatus }
  );
  return response.data.data;
};

export const leaveGroup = async (groupId: string) => {
  await axiosInstance.delete(`${API_URLS.groups.leaveGroup}/${groupId}`);
};

export const saveGroupMessages = async (message: string, groupId: string) => {
  const response = await axiosInstance.post(
    `${API_URLS.groups.saveGroupMessages}/${groupId}`,
    { message },
  );
  return response.data.data;
};

export const addExpense = async (groupId: string, expenseData: GroupExpenseInput | FormData) => {
  const response = await axiosInstance.post<GroupExpenseResponse>(
    `${API_URLS.groups.addGroupExpense}/${groupId}`,
    expenseData,
  );
  return response.data.data;
};

export const addSettlements = async (groupId: string, settlementData: GroupSettlementInput) => {
  const response = await axiosInstance.post<GroupSettlementResponse>(
    `${API_URLS.groups.addGroupSettlements}/${groupId}`,
    settlementData,
  );
  return response.data.data;
}

// 🔹 Function to fetch messages, expenses, and combined data
export const fetchMessagesExpensesAndSettlements = async (
  groupId: string,
  loadMessages: boolean,
  loadExpenses: boolean,
  pageSize: number,
  timestampMessage = new Date().toISOString(),
  timestampExpense = new Date().toISOString(),
  timestampCombined = new Date().toISOString()
): Promise<FetchGroupResult> => {
  try {
    const requests: Promise<any>[] = [];
    const requestTypes: ("messages" | "expenses" | "combined")[] = [];

    if (loadMessages) {
      requests.push(
        axiosInstance.get<GroupMessageResponse>(
          `${API_URLS.groups.getGroupMessages}/${groupId}`,
          {
            params: { pageSize, timestamp: timestampMessage },
          }
        )
      );
      requestTypes.push("messages");
    }

    if (loadExpenses) {
      requests.push(
        axiosInstance.get<FetchExpenseResponse>(
          `${API_URLS.groups.fetchExpensesSettlements}/${groupId}`,
          {
            params: { pageSize, timestamp: timestampExpense },
          }
        )
      );
      requestTypes.push("expenses");
    }

    if (!loadMessages && !loadExpenses) {
      requests.push(
        axiosInstance.get<CombinedGroupView>(
          `${API_URLS.groups.fetchGroupCombined}/${groupId}`,
          {
            params: { pageSize: pageSize * 2, timestamp: timestampCombined },
          }
        )
      );
      requestTypes.push("combined");
    }

    const responses = await Promise.all(requests);

    let messages: GroupMessageData[] = [];
    let expenses: GroupExpenseData[] = [];
    let combined: (
      | CombinedGroupMessage
      | CombinedGroupExpense
      | CombinedGroupSettlement
    )[] = [];

    // 🔹 Process API responses
    responses.forEach((response, index) => {
      if (!response.data.success || !("data" in response.data)) return;

      const sortedData = sortByCreatedAt(response.data.data);
      if (sortedData.length === 0) return;

      const requestType = requestTypes[index]; // Identify which request this response belongs to

      switch (requestType) {
        case "messages":
          messages = sortedData as GroupMessageData[];
          break;
        case "expenses":
          expenses = sortedData as GroupExpenseData[];
          break;
        case "combined":
          combined = sortedData as (
            | CombinedGroupMessage
            | CombinedGroupExpense
            | CombinedGroupSettlement)[];
          break;
        default:
          break;
      }
    });

    return {
      messages: [{ success: "true", message: "Success", data: messages }],
      expenses: [{ success: "true", message: "Success", data: expenses }],
      combined: [{ success: "true", message: "Success", data: combined }],
    };
  } catch (error) {
    toast.error("Error fetching messages and expenses:");
    return { messages: [], expenses: [], combined: [] };
  }
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

export const updateExpense = async (groupId: string, data: GroupExpenseInput | FormData) => {
  const response = await axiosInstance.patch<GroupExpenseResponse>(
    `${API_URLS.groups.updateGroupExpense}/${groupId}`,
    data,
  );
  return response.data.data;
};

export const updateSettlement = async (groupId: string, data: GroupSettlementInput) => {
  const response = await axiosInstance.patch<GroupSettlementResponse>(
    `${API_URLS.groups.updateGroupSettlement}/${groupId}`,
    data,
  );
  return response.data.data;
}

export const deleteExpenseAndSettlement = async (
  groupId: string,
  isExpense: boolean,
  id: string
) => {
  const url = isExpense
    ? API_URLS.groups.deleteGroupExpense
    : API_URLS.groups.deleteGroupSettlement;
  const body = isExpense
    ? { group_expense_id: id }
    : { group_settlement_id: id };
  const response = await axiosInstance.delete(`${url}/${groupId}`, {
    data: body,
  });
  return response.data.data;
};
