import API_URLS from '../../../constants/apis/urls';
import axiosInstance from '../../../services/axiosInterceptor';

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

export const fetchExpenses = async (conversationId: string) => {
    const response = await axiosInstance.get(`${API_URLS.friends.getExpenses}/${conversationId}`, {params: {fetchAll: true, timestamp: new Date().toISOString()}});
    return response.data.data;
}

export const deleteExpense = async (conversationId: string, expenseId: string) => {
    const response = await axiosInstance.delete(`${API_URLS.friends.deleteExpense}/${conversationId}`, { data: { "friend_expense_id": expenseId } });
    return response.data.data;
}
