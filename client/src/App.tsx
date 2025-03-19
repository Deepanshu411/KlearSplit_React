import './App.css'
import { RouterProvider } from 'react-router-dom'
import { router } from "./routes/routes"
import { Box } from '@mui/material';
import HashLoader from "react-spinners/ClipLoader";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useEffect, useState } from 'react';
import { login, logout } from './store/authSlice';
import { toast } from 'sonner';
import getUser from './services/userService';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUser();
        if (response.status === 200) {
          const userData = response.data;
          dispatch(login(userData));
        }
      } catch (error) {
        if (isAuthenticated) {
          toast.info('You have been logged out, please log in again!');
          dispatch(logout());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center px-[10%]">
        <Box className="hidden md:flex w-1/2 h-full text-white flex-col items-center justify-center p-10 bg-[url('/bgsvg.svg')] bg-no-repeat bg-contain bg-center">
          <h1 className="font-protest font-bold text-6xl mb-10 text-white p-10">
            KLEARSPLIT
          </h1>
        </Box>
        <Box className="flex items-center justify-center">
          <HashLoader className="text-6xl mb-10 p-10" color="#ffffff" />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
