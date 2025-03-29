import API_URLS from '../../../constants/apis/urls';
import axiosInstance from '../../../services/axiosInterceptor';

export const getGroups = async () => {
    const response = await axiosInstance.get(API_URLS.groups.getGroups);
    console.log(response.data.data.acceptedGroups);
    return response.data.data.acceptedGroups;
};

// export const fetchExpenses = async (conversationId: string) => {
//     const response = await axiosInstance.get(`${API_URLS.friends.getExpenses}/${conversationId}`, {params: {fetchAll: true, timestamp: new Date().toISOString()}});
//     return response.data.data;
// }

// export const deleteExpense = async (conversationId: string, expenseId: string) => {
//     const response = await axiosInstance.delete(`${API_URLS.friends.deleteExpense}/${conversationId}`, { data: { "friend_expense_id": expenseId } });
//     return response.data.data;
// }
