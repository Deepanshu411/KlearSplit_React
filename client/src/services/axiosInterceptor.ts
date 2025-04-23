import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import API_URLS, { API_URL } from "../constants/apis/urls";
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Function to get a user-friendly error message
const getErrorMessage = (status: number, error: any): string => {
    const defaultMessages: Record<number, string> = {
        400: error?.message || "Bad Request",
        401: "Unauthorized",
        403: error?.message || "You do not have permission to perform this action.",
        404: error?.message || "The requested resource was not found.",
        410: error?.message || "Account deleted, please restore it.",
        500: "Something went wrong. Please try again later.",
        503: "Service unavailable. Please try again later.",
    };

    return defaultMessages[status] || error?.message || "Something went wrong. Please try again.";
};

// Request interceptor (Optional: Attach Token if Needed)
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => {
        Promise.reject(error)
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response, // Return response if no error
    async (error) => {
        const { response } = error;

        if (!response) {
            return Promise.reject(error);
        }

        // Token Expired Handling (401)
        if (response.status === 401 && response?.data?.message === "Token expired") {
            try {
                await axiosInstance.get(API_URLS.auth.refreshAccessToken);
                return axiosInstance.request(error.config); // Retry the original request
            } catch (refreshError: AxiosError | any) {
                toast.error("Session expired. Please log in again.");
                return Promise.reject(refreshError);
            }
        }

        // Get a user-friendly error message
        const errorMessage = getErrorMessage(response.status, response.data);
        toast.error(errorMessage);

        return Promise.reject(error);
    }
);

export default axiosInstance;
