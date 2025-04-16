import { toast } from "sonner";
import API_URLS from "../../../constants/apis/urls";
import axiosInstance from "../../../services/axiosInterceptor";

const sortByCreatedAt = (data: (CombinedMessage | CombinedExpense)[]) => {
  return data.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
};

export const addFriend = async (email: string) => {
  const friend = await axiosInstance.post(API_URLS.friends.addFriend, {
    email,
  });
  return friend.data.data;
};

export const acceptRejectFriendRequest = async (
  conversationId: string,
  status: string
) => {
  const response = await axiosInstance.patch(
    `${API_URLS.friends.acceptRejectRequest}/${conversationId}`,
    { status }
  );
  return response.data.data;
};

export const getFriends = async (params: any): Promise<FriendData[]> => {
  const response = await axiosInstance.get(API_URLS.friends.getFriends, {
    params,
  });
  return response.data.data;
};

export const archiveBlockFriend = async (
  conversationId: string,
  type: string
) => {
  const response = await axiosInstance.patch(
    `${API_URLS.friends.archiveBlockRequest}/${conversationId}`,
    { type }
  );
  return response.data.data;
};

export const addExpense = async (
  conversationId: string,
  expenseData: SettlementData | ExpenseInput | FormData
) => {
  const expense = await axiosInstance.post<ExpenseResponse>(
    `${API_URLS.friends.addExpense}/${conversationId}`,
    expenseData
  );
  return expense.data.data;
};

// 🔹 Function to fetch messages, expenses, and combined data
export const fetchMessagesAndExpenses = async (
  conversationId: string,
  loadMessages: boolean,
  loadExpenses: boolean,
  pageSize: number,
  timestampMessage = new Date().toISOString(),
  timestampExpense = new Date().toISOString(),
  timestampCombined = new Date().toISOString()
): Promise<FetchResult> => {
  try {
    const requests: Promise<any>[] = [];
    const requestTypes: ("messages" | "expenses" | "combined")[] = [];

    if (loadMessages) {
      requests.push(
        axiosInstance.get<Message>(
          `${API_URLS.friends.getMessages}/${conversationId}`,
          {
            params: { pageSize, timestamp: timestampMessage },
          }
        )
      );
      requestTypes.push("messages");
    }

    if (loadExpenses) {
      requests.push(
        axiosInstance.get<Expense>(
          `${API_URLS.friends.getExpenses}/${conversationId}`,
          {
            params: { pageSize, timestamp: timestampExpense },
          }
        )
      );
      requestTypes.push("expenses");
    }

    if (!loadMessages && !loadExpenses) {
      requests.push(
        axiosInstance.get<CombinedView>(
          `${API_URLS.friends.getCombined}/${conversationId}`,
          {
            params: { pageSize: pageSize * 2, timestamp: timestampCombined },
          }
        )
      );
      requestTypes.push("combined");
    }

    const responses = await Promise.all(requests);

    let messages: MessageData[] = [];
    let expenses: ExpenseData[] = [];
    let combined: (CombinedExpense | CombinedMessage)[] = [];

    // 🔹 Process API responses
    responses.forEach((response, index) => {
      if (!response.data.success || !("data" in response.data)) return;

      const sortedData = sortByCreatedAt(response.data.data);
      if (sortedData.length === 0) return;

      const requestType = requestTypes[index]; // Identify which request this response belongs to

      switch (requestType) {
        case "messages":
          messages = sortedData as MessageData[];
          break;
        case "expenses":
          expenses = sortedData as ExpenseData[];
          break;
        case "combined":
          combined = sortedData as (CombinedExpense | CombinedMessage)[];
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

export const fetchAllExpenses = async (conversationId: string) => {
  const params = { fetchAll: true, timestamp: new Date().toISOString() };
  const response = await axiosInstance.get<Expense>(
    `${API_URLS.friends.getExpenses}/${conversationId}`,
    { params }
  );
  return response.data.data;
};

export const updateExpense = async (
  conversationId: string,
  expenseData: ExpenseInput | SettlementData | FormData,
) => {
  const response = await axiosInstance.patch<ExpenseResponse>(
    `${API_URLS.friends.updateExpense}/${conversationId}`,
    expenseData,
  );
  return response.data.data;
};

export const deleteExpense = async (
  conversationId: string,
  expenseId: string
) => {
  const response = await axiosInstance.delete(
    `${API_URLS.friends.deleteExpense}/${conversationId}`,
    { data: { friend_expense_id: expenseId } }
  );
  return response.data.data;
};

export const bulkAddExpenses = async (file: File, conversationId:string) => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("tableName", "friends_expenses");
  const response = await axiosInstance.post<{
    status: string;
    message: string;
    data: ExpenseData[];
  }>(`${API_URLS.friends.bulkAddExpenses}/${conversationId}`, formData);
  return response.data.data
}
