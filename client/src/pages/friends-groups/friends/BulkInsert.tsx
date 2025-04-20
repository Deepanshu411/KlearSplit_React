import React, { useState, useRef } from "react";
import {
  Button,
  DialogTitle,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Dialog,
  DialogContent,
  DialogProps,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "sonner"; // or your preferred toast library
import { bulkAddExpenses } from "./services";
import isFriendsConversation from "../utils/getConversationType";
import { CloudUploadOutlined } from "@mui/icons-material";

interface ErrorRow {
  row: number;
  errors: string[];
}

interface BulkInsertionProps extends DialogProps {
  open: boolean;
  chat: FriendData | GroupData;
  onCancel: () => void;
  onAddedExpenses: (data: ExpenseData[]) => void;
  onSwitchToSingle: () => void;
}

const BulkInsert: React.FC<BulkInsertionProps> = ({
  open,
  chat,
  onCancel,
  onAddedExpenses,
  onSwitchToSingle,
  ...rest
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorArray, setErrorArray] = useState<ErrorRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const fileExtension = file?.name.split(".").pop()?.toLowerCase();

    if (file && fileExtension === "csv") {
      setSelectedFile(file);
      setErrorMessage(null);
    } else {
      setSelectedFile(null);
      setErrorMessage("Please select a .csv file only.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setErrorArray([]);
      if (isFriendsConversation(chat)) {
        const response = await bulkAddExpenses(
          selectedFile,
          chat.conversation_id
        );
        onAddedExpenses(response);
        toast.success("Expenses added successfully!");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (Array.isArray(message)) {
        setErrorArray(message);
      } else {
        toast.error(message || "Something went wrong");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      {...rest}
    >
      <DialogTitle className="bg-blue-600 text-white text-center text-2xl">
        Bulk Insertion of Expenses
      </DialogTitle>
      <DialogContent className="p-0">
        <div className="flex flex-col gap-4 mt-4">
          <label
            htmlFor="expenses-file"
            className="text-inherit cursor-pointer border-2 border-gray-300 w-full text-center p-2"
          >
            <CloudUploadOutlined className="text-gray-500 me-2" />
            <span className="text-gray-500">
              Upload CSV File
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="expenses-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <a
            href="/sample.csv"
            download="sample.csv"
            className="download-link bg-blue-600 text-white font-bold px-4 py-2 rounded w-full text-center"
          >
            Download Sample CSV
          </a>

          {errorMessage && (
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
          )}

          <DialogActions className="flex justify-between">
            <Button
              onClick={onSwitchToSingle}
              className="text-green-600"
              disableRipple
            >
              Single Insertion
            </Button>

            <Box className="flex gap-2">
              <Button onClick={onCancel} color="error" disableRipple>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                disabled={!selectedFile}
              >
                Insert
              </Button>
            </Box>
          </DialogActions>

          {errorArray.length > 0 && (
            <div className="error-table-container mt-4">
              <TableContainer
                component={Paper}
                className="max-h-[300px] overflow-y-auto"
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Row Number</TableCell>
                      <TableCell>Errors</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {errorArray.map((err, index) => (
                      <TableRow key={index} hover>
                        <TableCell align="center">{err.row}</TableCell>
                        <TableCell>
                          {err.errors.map((msg, i) => (
                            <Typography key={i} color="error" variant="body2">
                              {msg}
                            </Typography>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkInsert;
