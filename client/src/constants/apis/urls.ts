export const BASE_URL = "http://localhost:3000";
export const API_URL = `${BASE_URL}/api`;

export default {
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        googleAuth: `${API_URL}/auth/google`,
        refreshAccessToken: "/auth/refreshtoken",
    },
    user: {
        verify: "/users/verify",
        register: "/users/register",
        verifyForgotPassword: "/users/verifyforgotpassword",
        forgotPassword: "/users/forgotpassword",
        restoreAccountVerify: "/users/verifyrestore",
        restoreAccount: "/users/restore",
        getUser: "/users/user",
        getUsers: "/users/getUsers",
        updateProfile: "/users",
    },
    dashboard: {
        expensesCount: "/dashboard/expensescount",
        balanceAmounts: "/dashboard/balance",
        cashFlowFriends: "/dashboard/cashflowfriends",
        monthlyExpenses: "/dashboard/monthlyexpenses",
        cashFlowGroups: "/dashboard/cashflowgroups",
    },
    friends: {
        addFriend: "/friends/addfriend",
        acceptRejectRequest: "/friends/acceptrejectfriend",
        withdrawRequest: "/friends/withdrawfriendrequest",
        getFriends: "/friends/getallfriends",
        archiveBlockRequest: "/friends/archiveblockfriend",
        addExpense: "/friends/addexpense",
        bulkAddExpenses: "/friends/expenses-bulkcreate",
        getExpenses: "/friends/getexpenses",
        getMessages: "/friends/getmessages",
        getCombined: "/friends/getboth",
        updateExpense: "/friends/updateexpense",
        deleteExpense: "/friends/deleteexpense",
    },
    groups: {
        createGroup: "/groups/create",
        getGroups: "/groups/usergroups",
        updateGroupMember: "/groups/updatemember",
        group: "/groups",
        saveGroupMessages: "/groups/savemessage",
        getGroupMessages: "/groups/getmessages",
        addGroupMembers: "/groups/addmembers",
        leaveGroup: "/groups/leavegroup",
        addGroupExpense: "/groups/addexpense",
        addGroupSettlements: "/groups/addsettlement",
        fetchExpensesSettlements: "/groups/expensessettlements",
        fetchGroupCombined: "/groups/messagesexpensessettlements",
        deleteGroupExpense: "/groups/deleteexpense",
        deleteGroupSettlement: "/groups/deletesettlement",
        updateGroupExpense: "/groups/updateexpense",
        updateGroupSettlement: "/groups/updatesettlement",
    },
    payment: {
        createPayment: "/payments/create-payment",
    }
};