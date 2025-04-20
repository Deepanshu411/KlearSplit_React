import axiosInstance from "../../../services/axiosInterceptor";
import API_URLS from "../../../constants/apis/urls";

const createPayment = async (
  amount: number,
  id: string,
  payerId: string,
  debtorId: string,
  type: string
) => {
  const response = await axiosInstance.post<{
    success: boolean;
    message: string;
    data: string;
  }>(`${API_URLS.payment.createPayment}`, {
    amount,
    id,
    payerId,
    debtorId,
    type,
  });
  return response.data.data;
};

export default createPayment;
