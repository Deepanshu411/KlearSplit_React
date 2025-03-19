import axios, { AxiosResponse } from 'axios';
import API_URLS from '../constants/apis/urls';
import axiosInstance from './axiosInterceptor';

const getUser = async(): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.get(API_URLS.user.getUser);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await axiosInstance.get(API_URLS.auth.refreshAccessToken);
      return getUser();
    }
    throw error; // Rethrow for other errors
  }
};

export default getUser;