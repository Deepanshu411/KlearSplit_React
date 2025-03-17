export const BASE_URL = "http://localhost:3000";
export const API_URL = `${BASE_URL}/api`;

export default {
    auth: {
        login: `${API_URL}/auth/login`,
        logout: `${API_URL}/auth/logout`,
        googleAuth: `${API_URL}/auth/google`,
        refreshAccessToken: `${API_URL}/auth/refreshtoken`,
    },
    user: {
        verify: `${API_URL}/users/verify`,
        register: `${API_URL}/users/register`,
        verifyForgotPassword: `${API_URL}/users/verifyforgotpassword`,
        forgotPassword: `${API_URL}/users/forgotpassword`,
        restoreAccountVerify: `${API_URL}/users/verifyrestore`,
        restoreAccount: `${API_URL}/users/restore`,
        getUser: `${API_URL}/users/user`,
        getUsers: `${API_URL}/users/getUsers`,
        updateProfile: `${API_URL}/users`,
    },
    dashboard: {
        expensesCount: `${API_URL}/dashboard/expensescount`,
        balanceAmounts: `${API_URL}/dashboard/balance`,
        cashFlowFriends: `${API_URL}/dashboard/cashflowfriends`,
        monthlyExpenses: `${API_URL}/dashboard/monthlyexpenses`,
        cashFlowGroups: `${API_URL}/dashboard/cashflowgroups`,
    }
}