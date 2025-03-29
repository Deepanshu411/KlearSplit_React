import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import UnprotectedRoute from "../components/base/unprotectedRoute";
import ProtectedRoute from "../components/base/protectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard";
import ForgotPassword from "../pages/auth/ForgotPassword";
import FriendsPage from "../pages/friends-groups/friends";
import GroupsPage from "../pages/friends-groups/groups";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <UnprotectedRoute />,
        children: [
            {
                index: true,
                element: <LandingPage />
            },
            {
                path: 'register',
                element: <RegisterPage/>
            },
            {
                path: 'login',
                element: <LoginPage/>
            },
            {
                path: 'forgot-password',
                element: <ForgotPassword/>
            },
        ]
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                path: 'dashboard',
                element: <DashboardPage/>
            },
            {
                path: 'friends',
                element: <FriendsPage/>
            },
            {
                path: 'groups',
                element: <GroupsPage/>
            }
        ]
    }
])