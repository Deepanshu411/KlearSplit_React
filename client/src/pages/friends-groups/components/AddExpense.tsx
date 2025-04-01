import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, TextField, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import { useEffect, useState } from "react"
import SvgIcon from '@mui/joy/SvgIcon';
import { styled } from '@mui/joy';
import Button from '@mui/joy/Button';
import Payer from "./Payer"
import { motion } from "framer-motion"
import SplitType from "./SplitType"

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

interface AddExpenseProps {
    open: boolean;
    friend: FriendData;
    handleAddExpensesClose: () => void;
    payer: User | null;
    setPayer: (payer: User) => void;
    splitType: "EQUAL" | "UNEQUAL" | "PERCENTAGE";
    setSplitType: (splitType: "EQUAL" | "UNEQUAL" | "PERCENTAGE") => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ open, friend, handleAddExpensesClose, payer, setPayer, splitType, setSplitType }) => {
    const user = useSelector((store: RootState) => store.auth.user)
    const [participants, setParticipants] = useState<User[] | []>([]);
    
    useEffect(() => {
        setParticipants([user!, {...(friend.friend), phone: "" }]);
    }, []);

    const [expenseInfo, setExpenseInfo] = useState({
        expense_name: "",
        total_amount: "",
        description: "",
        payer_id: user?.user_id,
        participant1_share: 0,
        participant2_share: 0,
        split_type: "EQUAL",
        receipt: null
    });
    const [errors, setErrors] = useState({
        expense_name: "",
        total_amount: "",
        description: ""
    })
    const [payerDialogOpen, setPayerDialogOpen] = useState(false);
    const [splitTypeOpen, setSplitTypeOpen] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const handlePayerDialogOpen = () => {
        setPayerDialogOpen(true);
    }
    const handleSplitTypeOpen = () => {
        setSplitTypeOpen(true);
    }
    const handlePayerDialogClose = () => setPayerDialogOpen(false);
    const handleSplitTypeClose = () => setSplitTypeOpen(false);

    const validateFields = () => {
        let newErrors = { expense_name: "", total_amount: "", description: "" };
        if (!expenseInfo.expense_name.trim()) {
            newErrors.expense_name = "Expense name is required";
        } else {
            if (expenseInfo.expense_name.trim().length > 50) {
                newErrors.expense_name = "Expense name must not exceed 50 characters."
            }
        }
        if (!expenseInfo.total_amount.trim()) {
            newErrors.total_amount = "Total amount is required";
        } else {
            const amount = parseFloat(expenseInfo.total_amount);
            if (isNaN(amount) || amount <= 0 || amount > 9999999999.99) {
                newErrors.total_amount = "Amount must be between 0.01 and 9,999,999,999.99";
            }
        }
        if (expenseInfo.description.trim() && expenseInfo.description.trim().length > 150) {
            newErrors.description = "Description must not exceed 150 characters."
        }
        setErrors(newErrors);
        const formValid = !newErrors.expense_name && !newErrors.total_amount;
        setIsFormValid(formValid); // Store validation result in state
        return formValid;
    };

    const onBlurValidation = () => validateFields();

    const onChange = (key: string, value: string | number) => setExpenseInfo((prev) => ({ ...prev, [key]: value }))
    return (
        <>
            <SplitType open={splitTypeOpen} participants={participants} handleSplitTypeClose={handleSplitTypeClose} splitType={splitType} setSplitType={setSplitType} />
            <Payer open={payerDialogOpen} participants={participants} handlePayerDialogClose={handlePayerDialogClose} setPayer={setPayer} />
            <Modal open={open} onClose={() => handleAddExpensesClose()}>
                <motion.div
                    initial={{ x: 0 }}
                    animate={(payerDialogOpen || splitTypeOpen) ? { x: -200 } : { x: 0 }} // Slide to the left when second modal opens
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        height: "100%",
                        zIndex: 10
                    }}
                >
                    <ModalDialog
                        sx={{
                            backgroundColor: "white",
                            position: "fixed",
                            top: "10",
                            minWidth: "35%",
                            padding: 0,
                            border: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                            zIndex: 10
                        }}
                    >
                        {/* <ModalClose onClick={() => handleViewExpensesClose()} /> */}
                        <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Add Expense</DialogTitle>
                        <Box className="rounded bg-[white] flex flex-col gap-3 p-3">
                            <TextField
                                label="Expense Name"
                                required
                                variant="outlined"
                                name="expense_name"
                                value={expenseInfo.expense_name}
                                onChange={(e) => onChange("expense_name", e.target.value)}
                                onBlur={onBlurValidation}
                                fullWidth
                                error={!!errors.expense_name}
                                helperText={errors.expense_name}
                            />

                            <TextField
                                label="Total Amount"
                                required
                                variant="outlined"
                                name="total_amount"
                                value={expenseInfo.total_amount}
                                onChange={(e) => onChange("total_amount", e.target.value)}
                                onBlur={onBlurValidation}
                                fullWidth
                                error={!!errors.total_amount}
                                helperText={errors.total_amount}
                            />
                            <TextField
                                label="Description"
                                variant="outlined"
                                name="description"
                                value={expenseInfo.description}
                                onChange={(e) => onChange("description", e.target.value)}
                                onBlur={onBlurValidation}
                                fullWidth
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                            <Box className="rounded-lg flex justify-center items-center gap-2">
                                <Typography>Paid by</Typography>
                                <Button sx={{ borderRadius: "50px" }} onClick={handlePayerDialogOpen} variant="outlined" disabled={!isFormValid}>{payer?.user_id === user?.user_id ? "you" : payer?.first_name}</Button>
                                <Typography>and split</Typography>
                                <Button sx={{ borderRadius: "50px" }} onClick={handleSplitTypeOpen} variant="outlined" disabled={!isFormValid}>{splitType}</Button>
                            </Box>
                            <Button
                                component="label"
                                role={undefined}
                                tabIndex={-1}
                                variant="outlined"
                                color="neutral"
                                startDecorator={
                                    <SvgIcon>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                            />
                                        </svg>
                                    </SvgIcon>
                                }
                            >
                                Upload Receipt
                                <VisuallyHiddenInput type="file" />
                            </Button>
                            <Box className="flex justify-between items-center">
                                <Button >
                                    Bulk Insertion of Expenses
                                </Button>
                                <Box className="flex gap-3">
                                    <Button onClick={handleAddExpensesClose}>
                                        Cancel
                                    </Button>
                                    <Button disabled={!isFormValid}>
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </ModalDialog>
                </motion.div>
            </Modal>
        </>
    )
}

export default AddExpense