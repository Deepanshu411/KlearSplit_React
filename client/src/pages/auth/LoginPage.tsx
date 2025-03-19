import { Google, Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import { Stack, TextField, Button, Typography, InputAdornment, IconButton } from "@mui/material";
import { AxiosError } from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../../store/authSlice";
import { onLogin } from "./authService";
import API_URLS from "../../constants/apis/urls";
import logo from "/logo.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for login info
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoginDisabled, setIsLoginDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Validation function
  const validateField = (name: string, value: string) => {
    if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;

    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format";
    }

    return "";
  };

  // Update field values and errors
  const handleChange = useCallback((key: string, value: string) => {
    setLoginInfo((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
  }, []);

  // Check if form is valid
  useEffect(() => {
    setIsLoginDisabled(Object.values(loginInfo).some((val) => !val) || Object.values(errors).some((err) => err));
  }, [loginInfo, errors]);

  // Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await onLogin(loginInfo);
      dispatch(login(res.data));
      navigate("/dashboard");
      toast.success(res.message);
    } catch (error: AxiosError | any) {
      toast.error(error.response?.data.message || error.message);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Handle Google login
  const handleGoogleLogin = () => {
    window.open(API_URLS.auth.googleAuth, "_self");
  };

  return (
    <div className="flex justify-center min-h-screen items-center w-full md:w-6/7 mx-auto grid grid-cols-10 p-10 rounded-sm">
      {/* Left Section */}
      <div className="md:col-span-5 col-span-10 h-full bg-[#D1F8EF] shadow-2xl rounded-lg md:rounded-l-lg md:rounded-r-none p-6 flex flex-col items-center">
        <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 700 }}>
          <div className="flex justify-center items-center">
            <img src={logo} width="85" alt="logo" />
          </div>
          KLEARSPLIT
        </Typography>

        <form onSubmit={handleSubmit} className="w-full">
          <Stack spacing={2}>
            {/* Email Field */}
            <TextField
              label="Email"
              required
              variant="outlined"
              name="email"
              value={loginInfo.email}
              onChange={(e) => handleChange("email", e.target.value.trim())}
              onBlur={(e) => handleChange("email", e.target.value.trim())}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              variant="outlined"
              required
              label="Password"
              type={showPassword ? "text" : "password"}
              value={loginInfo.password}
              error={!!errors.password}
              helperText={errors.password}
              onChange={(e) => handleChange("password", e.target.value.trim())}
              onBlur={(e) => handleChange("password", e.target.value.trim())}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Forgot your Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button variant="contained" type="submit" disabled={isLoginDisabled} fullWidth>
              LOGIN
            </Button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="mx-2 text-gray-600">OR</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              sx={{ padding: 2 }}
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Button>

            {/* Register Link */}
            <div className="text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:underline">
                Register now
              </Link>
            </div>
          </Stack>
        </form>
      </div>

      {/* Right Section */}
      <div className="col-span-5 h-full md:w-full hidden md:box lg:flex items-center bg-[#3674B5] rounded-r-lg shadow-2xl px-10 py-12 text-white">
        <div>
          <h4 className="text-2xl font-semibold mb-4">Welcome to KlearSplit!</h4>
          <p className="text-sm mb-4">
            Easily manage and split bills with friends and family. Whether you're sharing a meal, an apartment, or travel expenses, our intuitive platform takes the hassle out of dividing costs.
          </p>
          <ul className="text-sm list-disc pl-5">
            <li>Effortless Bill Splitting: Quickly calculate each person's share.</li>
            <li>Track Expenses: Keep an organized record of who owes what.</li>
            <li>Reminders: Never forget to settle up with gentle reminders.</li>
          </ul>
          <p className="text-sm mt-4">Start enjoying stress-free sharing today!</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
