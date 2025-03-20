import API_URLS from '../../constants/apis/urls';
import axiosInstance from '../../services/axiosInterceptor';

export const getExpense = async () => {
  const response = await axiosInstance.get(API_URLS.dashboard.expensesCount);
  return [
    {
      data: response.data.data.map((value: number, index: number) => ({
        id: index,
        value: value || 0, // Replace NaN with 0
        label: ["1-1000", "1001-5000", "5001-10000", "10001-15000", ">15000"][index] || `Category ${index}`,
      })),
    },
  ];
};

export const getBalanceAmounts = async () => {
  const response = await axiosInstance.get(API_URLS.dashboard.balanceAmounts);
  return [
    {
      data: response.data.data.map((value: number, index: number) => ({
        id: index,
        value: value || 0,
        label: ["Amount Lent", "Amount Borrowed"][index] || `Category ${index}`,
        color: ["Green", "Red"][index],
      })),
      innerRadius: 30,
      outerRadius: 100,
      paddingAngle: 5,
    },
  ];
};

export const getCashFlowFriends = async () => {
  const response = await axiosInstance.get(API_URLS.dashboard.cashFlowFriends);
  const cashFlowFriendsData = Object.entries(response.data.data).map(([, item]: [string, any], index: number) => ({
    id: index, // Sequential ID for PieChart
    value: item.amount || 0, // Extracting the amount
    label: item.friend || `Category ${index}`, // Extracting the friend name
  }));

  return [
    {
      data: cashFlowFriendsData,
    },
  ];
};

export const getMonthlyExpenses = async (year: number) => {
  const response = await axiosInstance.post(API_URLS.dashboard.monthlyExpenses, { year });

  return [
    {
      data: response.data.data,
    },
  ];
};

export const getCashFlowGroups = async () => {
  const response = await axiosInstance.get(API_URLS.dashboard.cashFlowGroups);
  const cashFlowGroupsData = Object.entries(response.data.data).map(([, item]: [string, any], index: number) => ({
    id: index, // Sequential ID for PieChart
    value: item.amount || 0, // Extracting the amount
    label: item.group || `Category ${index}`, // Extracting the group name
  }));

  return [
    {
      data: cashFlowGroupsData,
    },
  ];
};