import { useState } from "react";
import { TextField, Button, Typography, Stack, InputAdornment } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import authService from "./authService";
import logo from "/logo.png";
import { Person, Lock } from "@mui/icons-material";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({ email: "", otp: "" });
    const navigate = useNavigate();

    // Validate input fields
    const validate = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "email": {
                if (!value) {
                    error = "Email is required";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "Invalid email format";
                }
            }
            break;
            case "otp": {
                if (!value) {
                    error = "OTP is required";
                } else if (!/^\d{6}$/.test(value)) {
                    error = "OTP must be a 6-digit number";
                }
            }
            break;
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    // Handle input changes and validate
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        if (name === "otp") setOtp(value);
        validate(name, value);
    };

    // Check if form is valid
    const isForgotPasswordDisabled = () =>
        !email || !!errors.email || (step === 2 && (!otp || !!errors.otp));

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (errors.email) return;
        const res = await authService.verifyForgotPassword(email);
        if (!res) return;
        toast.success("OTP sent to your email");
        setStep(2);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (errors.otp) return;
        const res = await authService.forgotPassword(email, otp);
        if (!res) return;
        toast.success("OTP verified");
        navigate("/login");
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

                <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="w-full py-4">
                    <Stack spacing={2}>
                        {/* Email Field */}
                        <TextField
                            label="Email"
                            required
                            variant="outlined"
                            name="email"
                            value={email}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {step === 2 && (
                            <TextField
                                label="OTP"
                                required
                                variant="outlined"
                                name="otp"
                                value={otp}
                                onChange={handleInputChange}
                                error={!!errors.otp}
                                helperText={errors.otp}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        {/* Submit Button */}
                        <Button variant="contained" type="submit" disabled={isForgotPasswordDisabled()} fullWidth>
                            {step === 1 ? "Send OTP" : "Verify OTP"}
                        </Button>

                        {/* Back to Login */}
                        <div className="text-right">
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Back to Login
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center">
                            <div className="flex-grow border-t border-gray-400"></div>
                            <span className="mx-2 text-gray-600">OR</span>
                            <div className="flex-grow border-t border-gray-400"></div>
                        </div>

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

export default ForgotPassword;
