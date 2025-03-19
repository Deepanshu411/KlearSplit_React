export const BASE_URL = "http://localhost:3000";
export const API_URL = `${BASE_URL}/api`;

export default {
    auth: {
        login: `/auth/login`,
        logout: `/auth/logout`,
        googleAuth: `/auth/google`,
        refreshAccessToken: `/auth/refreshtoken`,
    },
    user: {
        verify: `/users/verify`,
        register: `/users/register`,
        verifyForgotPassword: `/users/verifyforgotpassword`,
        forgotPassword: `/users/forgotpassword`,
        restoreAccountVerify: `/users/verifyrestore`,
        restoreAccount: `/users/restore`,
        getUser: `/users/user`,
        getUsers: `/users/getUsers`,
        updateProfile: `/users`,
    },
    dashboard: {
        expensesCount: `/dashboard/expensescount`,
        balanceAmounts: `/dashboard/balance`,
        cashFlowFriends: `/dashboard/cashflowfriends`,
        monthlyExpenses: `/dashboard/monthlyexpenses`,
        cashFlowGroups: `/dashboard/cashflowgroups`,
    }
}