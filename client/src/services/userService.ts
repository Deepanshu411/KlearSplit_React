import { AxiosResponse } from 'axios';
import API_URLS from '../constants/apis/urls';
import axiosInstance from './axiosInterceptor';

const getUser = async(): Promise<AxiosResponse> => {
  const response = await axiosInstance.get(API_URLS.user.getUser);
  return response;
};

export const searchUser = async (query: string, fetchAll: boolean = false ) => {
  const user = await axiosInstance.get(`${API_URLS.user.getUsers}/${query}`, { params: { fetchAll } });
  return user.data.data;
};

export const updateUser = async (id: string, updatedUser: User | FormData) => {
  const response = await axiosInstance.patch(`${API_URLS.user.updateProfile}/${id}`, updatedUser);
  return response.data.data;
}

export default getUser;