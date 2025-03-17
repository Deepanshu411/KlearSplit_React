import axios from 'axios';
import DASHBOARD_URLS from '../../constants/apis/urls';

export const getExpense = async () => {
  const response = await axios.get(DASHBOARD_URLS.dashboard.expensesCount, { withCredentials: true });
  return response.data;
};

export const getBalanceAmounts = async () => {
  const response = await axios.get(DASHBOARD_URLS.dashboard.balanceAmounts, { withCredentials: true });
  return response.data;
};

export const getCashFlowFriends = async () => {
  const response = await axios.get(DASHBOARD_URLS.dashboard.cashFlowFriends, { withCredentials: true });
  const topAmounts: number[] = [];
  const friendsName: string[] = [];
  Object.values(response.data).forEach((item: any) => {
    topAmounts.push(Number(item.amount));
    friendsName.push(String(item.friend));
  });
  return {
    topFriends: topAmounts,
    topFriendsName: friendsName,
  };
};

export const getMonthlyExpenses = async (year: number) => {
  const response = await axios.post(DASHBOARD_URLS.dashboard.monthlyExpenses, { year }, { withCredentials: true });
  return response.data;
};

export const getCashFlowGroups = async () => {
  const response = await axios.get(DASHBOARD_URLS.dashboard.cashFlowGroups, { withCredentials: true });
  const topAmounts: number[] = [];
  const groupsName: string[] = [];
  Object.values(response.data).forEach((item: any) => {
    topAmounts.push(Number(item.amount));
    groupsName.push(String(item.group));
  });
  return {
    topFriends: topAmounts,
    topGroupsName: groupsName,
  };
};