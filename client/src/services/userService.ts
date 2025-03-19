import { AxiosResponse } from 'axios';
import API_URLS from '../constants/apis/urls';
import axiosInstance from './axiosInterceptor';

const getUser = async(): Promise<AxiosResponse> => {
  const response = await axiosInstance.get(API_URLS.user.getUser);
  return response;
};

export default getUser;