import API_URLS from '../../../constants/apis/urls';
import axiosInstance from '../../../services/axiosInterceptor';

const sortByCreatedAt = (data: (CombinedMessage | CombinedExpense)[]) => {
    return data.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export const searchUser = async (query: string) => {
    const user = await axiosInstance.get(`${API_URLS.user.getUsers}/${query}`);
    return user.data.data;
}

export const addFriend = async (email: string) => {
    const friend = await axiosInstance.post(API_URLS.friends.addFriend, { email });
    return friend.data.data;
}

export const getFriends = async () => {
    const response = await axiosInstance.get(API_URLS.friends.getFriends);
    return response.data.data;
};

// 🔹 Generic function to sort data by createdAt timestamp
// const sortByCreatedAt = <T extends { createdAt: string }>(data: T[]): T[] => {
//     return data.sort(
//         (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//     );
// };

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

        if (loadMessages) {
            requests.push(
                axiosInstance.get<Message>(`${API_URLS.friends.getMessages}/${conversationId}`, {
                    params: { pageSize, timestamp: timestampMessage },
                    withCredentials: true,
                })
            );
        }

        if (loadExpenses) {
            requests.push(
                axiosInstance.get<Expense>(`${API_URLS.friends.getExpenses}/${conversationId}`, {
                    params: { pageSize, timestamp: timestampExpense },
                    withCredentials: true,
                })
            );
        }

        if (!loadMessages && !loadExpenses) {
            requests.push(
                axiosInstance.get<CombinedView>(`${API_URLS.friends.getCombined}/${conversationId}`, {
                    params: { pageSize: pageSize * 2, timestamp: timestampCombined },
                    withCredentials: true,
                })
            );
        }

        const responses = await Promise.all(requests);

        let messages: MessageData[] = [];
        let expenses: ExpenseData[] = [];
        let combined: (CombinedExpense | CombinedMessage)[] = [];

        // 🔹 Process API responses
        responses.forEach((response) => {
            if (response.data.success) {
                if ("data" in response.data) {
                    const sortedData = sortByCreatedAt(response.data.data);
                    if (sortedData.length > 0) {
                        if ("message" in sortedData[0]) {
                            messages = sortedData as MessageData[];
                        } else if ("total_amount" in sortedData[0]) {
                            expenses = sortedData as ExpenseData[];
                        } else {
                            combined = sortedData as (CombinedExpense | CombinedMessage)[];
                        }
                    }
                }
            }
        });

        return { messages: [{ success: "true", message: "Success", data: messages }], expenses: [{ success: "true", message: "Success", data: expenses }], combined: [{ success: "true", message: "Success", data: combined }] };
    } catch (error) {
        console.error("Error fetching messages and expenses:", error);
        return { messages: [], expenses: [], combined: [] };
    }
};

export const fetchAllExpenses = async (conversationId: string) => {
    const response = await axiosInstance.get(`${API_URLS.friends.getExpenses}/${conversationId}`, { params: { fetchAll: true, timestamp: new Date().toISOString() } });
    return response.data.data;
}

export const deleteExpense = async (conversationId: string, expenseId: string) => {
    const response = await axiosInstance.delete(`${API_URLS.friends.deleteExpense}/${conversationId}`, { data: { "friend_expense_id": expenseId } });
    return response.data.data;
}
