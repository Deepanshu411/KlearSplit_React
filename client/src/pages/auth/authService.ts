import API_URLS from '../../constants/apis/urls';
import axiosInstance from '../../services/axiosInterceptor';

const onLogin = async (loginInfo: {email: string, password: string}) => {
  const response = await axiosInstance.post(API_URLS.auth.login, loginInfo);
  if (!response.data.success) {
    throw new Error("Invalid credentials");
  }
  return response.data;
};

const onLogout = async () => {
    const response = await axiosInstance.get(API_URLS.auth.logout);
    return response.data;
};

const onRefreshToken = async () => {
    const response = await axiosInstance.get(API_URLS.auth.refreshAccessToken);
    return response.data;
};

const verifyForgotPassword = async (email: string) => {
    const response = await axiosInstance.post(API_URLS.user.verifyForgotPassword, { email });
    return response.data;
};

const forgotPassword = async (email: string, otp: string) => {
    const response = await axiosInstance.post(API_URLS.user.forgotPassword, { email, otp });
    return response.data;
};

export default {
    onLogin,
    onLogout,
    onRefreshToken,
    verifyForgotPassword,
    forgotPassword
};