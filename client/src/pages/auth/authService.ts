import API_URLS from '../../constants/apis/urls';
import axiosInstance from '../../services/axiosInterceptor';

export const onLogin = async (loginInfo: {email: string, password: string}) => {
  const response = await axiosInstance.post(API_URLS.auth.login, loginInfo);
  if (!response.data.success) {
    throw new Error("Invalid credentials");
  }
  return response.data;
}

export const onLogout = async () => {
    const response = await axiosInstance.get(API_URLS.auth.logout);
    return response.data;
}

export const onRefreshToken = async () => {
    const response = await axiosInstance.get(API_URLS.auth.refreshAccessToken);
    return response.data;
}