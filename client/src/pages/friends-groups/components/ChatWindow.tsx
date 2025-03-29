import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchMessagesAndExpenses } from "../friends/services";
import ExpenseItem from "./Expense";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { LinearProgress } from "@mui/material";
import useScrollToBottom from "../hooks/useScrollToBottom";

interface ChatWindowProp {
    friend: FriendData | null
}

const PAGE_SIZE = 20;

const ChatWindow: React.FC<ChatWindowProp> = ({ friend }) => {
    const user = useSelector(
        (state: RootState) => state.auth.user
    )
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [combinedView, setCombinedView] = useState<(CombinedMessage | CombinedExpense)[]>([]);
    const [loading, setLoading] = useState(false);
    const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
    const [allExpensesLoaded, setAllExpensesLoaded] = useState(false);
    const [allCombinedLoaded, setAllCombinedLoaded] = useState(false);

    const [timestampMessages, setTimestampMessages] = useState<string>(new Date().toISOString());
    const [timestampExpenses, setTimestampExpenses] = useState<string>(new Date().toISOString());
    const [timestampCombined, setTimestampCombined] = useState<string>(new Date().toISOString());

    const messagesStartRef = useRef<HTMLDivElement | null>(null);
    // const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { messageContainerRef, scrollToBottom } = useScrollToBottom();

    // 🔹 Function to check if all items are loaded
    const checkAndSetLoaded = (type: "messages" | "expenses" | "combined", newData: any[], pageSize: number) => {
        if (newData.length < pageSize) {
            if (type === "messages") setAllMessagesLoaded(true);
            if (type === "expenses") setAllExpensesLoaded(true);
            if (type === "combined") setAllCombinedLoaded(true);
        }
    };

    // 🔹 Function to Fetch Data
    const fetchData = useCallback(async () => {
        if (loading) return;

        let loadMessages = true;
        let loadExpenses = true;
        let loadCombined = true;

        setLoading(true);

        const response: FetchResult = await fetchMessagesAndExpenses(
            friend?.conversation_id!,
            loadMessages,
            loadExpenses,
            PAGE_SIZE,
            timestampMessages,
            timestampExpenses,
            timestampCombined
        );

        const newMessages = response.messages.flatMap((msg) => msg.data);
        const newExpenses = response.expenses.flatMap((exp) => exp.data);
        const newCombined = response.combined.flatMap((com) => com.data);

        // 🔹 Prepend old messages for infinite scrolling
        setMessages((prev) => [ ...newMessages, ...prev ]);
        setExpenses((prev) => [ ...newExpenses, ...prev ]);
        setCombinedView((prev) => [ ...newCombined, ...prev ]);

        // 🔹 Check if all items are loaded
        checkAndSetLoaded("messages", newMessages, PAGE_SIZE);
        checkAndSetLoaded("expenses", newExpenses, PAGE_SIZE);
        checkAndSetLoaded("combined", newCombined, PAGE_SIZE);

        if (
            (loadMessages && allMessagesLoaded) ||
            (loadExpenses && allExpensesLoaded) ||
            (loadCombined && allCombinedLoaded)
        ) {
            setLoading(false);
            return;
        }

        // 🔹 Update timestamps for fetching older messages
        if (newMessages.length) setTimestampMessages(newMessages[0].createdAt);
        if (newExpenses.length) setTimestampExpenses(newExpenses[0].createdAt);
        if (newCombined.length) setTimestampCombined(newCombined[0].createdAt);

        setLoading(false);
    }, [
        loading,
        allMessagesLoaded,
        allExpensesLoaded,
        allCombinedLoaded,
        friend?.conversation_id,
        timestampMessages,
        timestampExpenses,
        timestampCombined,
        checkAndSetLoaded,
    ]);

    // 🔹 Infinite Scroll Observer
    useEffect(() => {
        if (!messagesStartRef.current) return;

        observer.current = new IntersectionObserver(
            (entries) => {
                console.log("Inside observer", entries, loading);
                
                if (entries[0].isIntersecting && !loading) {
                    fetchData(); // Load older messages when reaching top
                }
            },
            { root: null, threshold: 1.0 }
        );

        observer.current.observe(messagesStartRef.current);

        return () => observer.current?.disconnect();

    }, [loading]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [messages, expenses]); // ✅ Scrolls to the first message

    return (
        <div ref={messageContainerRef} className="min-h-90 max-h-90 overflow-y-auto">
            <div ref={messagesStartRef}></div>
            {loading && <LinearProgress />}
            {/* Messages or Expenses go here */}
            {expenses.map((expense, index) => (
                <ExpenseItem
                    key={index}
                    expense={{
                        expense_id: expense.friend_expense_id,
                        expense_name: expense.expense_name,
                        payer_id: expense.payer_id,
                        total_amount: expense.total_amount,
                        debtor_amount: expense.debtor_amount,
                        createdAt: expense.createdAt,
                        updatedAt: expense.updatedAt,
                    }}
                    isCurrentUserPayer={expense.payer_id === user?.user_id}
                    currentUserImageUrl={user?.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                    imageUrl={friend?.friend.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                    name={friend?.friend.first_name!}
                />
            ))}
            {/* <div ref={messagesEndRef}></div> This will trigger the observer */}
        </div>
    );
};

export default ChatWindow;
