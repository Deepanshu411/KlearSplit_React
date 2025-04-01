import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchMessagesAndExpenses } from "../friends/services";
import ExpenseItem from "./Expense";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { LinearProgress } from "@mui/material";
import useScrollToBottom from "../hooks/useScrollToBottom";
import MessageItem from "./Message";
import { toast } from "sonner";

interface ChatWindowProp {
    currentView: "All" | "Expenses" | "Messages";
    friend: FriendData | null
}

const PAGE_SIZE = 20;

const ChatWindow: React.FC<ChatWindowProp> = ({ currentView, friend }) => {
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
    const previousScrollHeight = useRef(0);
    const previousScrollTop = useRef(0);
    const firstLoad = useRef(true);
    const prevView = useRef<"All" | "Expenses" | "Messages" | null>(null);
    const isFetching = useRef(false);

    // 🔹 Function to check if all items are loaded
    const checkAndSetLoaded = useCallback((type: "messages" | "expenses" | "combined", newData: any[], pageSize: number) => {
        if (newData.length < pageSize) {
            if (type === "messages") setAllMessagesLoaded(true);
            if (type === "expenses") setAllExpensesLoaded(true);
            if (type === "combined") setAllCombinedLoaded(true);
        }
    }, []);

    const isCombinedExpense = (item: CombinedExpense | CombinedMessage): item is CombinedExpense => {
        return (item as CombinedExpense).payer_id !== undefined;
    }

    // 🔹 Function to Fetch Data
    const fetchData = useCallback(async () => {
        if (loading || isFetching.current) return;

        let loadMessages = false;
        let loadExpenses = false;
        let loadCombined = false;

        switch (currentView) {
            case "All":
                loadCombined = true;
                break;
            case "Expenses":
                loadExpenses = true;
                break;
            case "Messages":
                loadMessages = true;
                break;
            default:
                break;
        }

        isFetching.current = true;
        setLoading(true);

        try {
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
            setMessages((prev) => [...newMessages, ...prev]);
            setExpenses((prev) => [...newExpenses, ...prev]);
            setCombinedView((prev) => [...newCombined, ...prev]);

            // 🔹 Check if all items are loaded
            checkAndSetLoaded("messages", newMessages, PAGE_SIZE);
            checkAndSetLoaded("expenses", newExpenses, PAGE_SIZE);
            checkAndSetLoaded("combined", newCombined, PAGE_SIZE);

            if (
                (loadMessages && allMessagesLoaded) ||
                (loadExpenses && allExpensesLoaded) ||
                (loadCombined && allCombinedLoaded)
            ) {
                return;
            }

            // 🔹 Update timestamps for fetching older messages
            if (newMessages.length) setTimestampMessages(() => newMessages[0].createdAt);
            if (newExpenses.length) setTimestampExpenses(() => newExpenses[0].createdAt);
            if (newCombined.length) setTimestampCombined(() => newCombined[0].createdAt);


            // 🔹 Restore scroll position after the DOM updates
            setTimeout(() => {
                if (messageContainerRef.current) {
                    const newScrollHeight = messageContainerRef.current.scrollHeight;

                    messageContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight.current + previousScrollTop.current;

                    // Update for the next turn
                    previousScrollHeight.current = messageContainerRef.current.scrollHeight;
                    previousScrollTop.current = messageContainerRef.current.scrollTop;
                }
            }, 0);
        } catch (error) {
            toast.error("Something went wrong! Please try again later.")
        } finally {
            isFetching.current = false;
            setLoading((prevLoading) => {
                if (!prevLoading) return prevLoading; // Prevent unnecessary updates
                return false;
            });
        }
    }, [
        friend?.conversation_id,
        timestampMessages,
        timestampExpenses,
        timestampCombined,
        checkAndSetLoaded,
        currentView,
    ]);

    // 🔹 Infinite Scroll Observer
    useEffect(() => {
        if (!messagesStartRef.current) return;

        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    fetchData(); // Load older messages when reaching top
                }
            },
            { root: null, threshold: 1.0 }
        );

        observer.current.observe(messagesStartRef.current);

        return () => observer.current?.disconnect();

    }, [timestampCombined, timestampExpenses, timestampMessages, currentView]);

    useEffect(() => {
        // Ensure messages, expenses, or combinedView have loaded
        if (firstLoad.current || prevView.current !== currentView) {
            if (messages.length > 0 || expenses.length > 0 || combinedView.length > 0) {
                scrollToBottom();
                firstLoad.current = false;
                prevView.current = currentView; // update prevView after data loads
            }
        }
    }, [currentView, messages, expenses, combinedView]);

    return (
        <div ref={messageContainerRef} className="min-h-[67vh] max-h-[67vh] overflow-y-auto">
            <div ref={messagesStartRef}></div>
            {loading && <LinearProgress />}
            {/* Messages or Expenses go here */}
            {currentView === "All" && <div className="space-y-2">
                {combinedView.map((item, index) => (
                    <div key={index}>
                        {!isCombinedExpense(item) ? (
                            <MessageItem
                                message={{
                                    message: item.message,
                                    createdAt: item.createdAt,
                                    updatedAt: item.updatedAt
                                }}
                                isCurrentUser={item.sender_id === user?.user_id}
                                currentUserImageUrl={user?.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                                imageUrl={friend?.friend.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                                name={friend?.friend.first_name!}
                            />
                        ) : (
                            <ExpenseItem
                                expense={{
                                    expense_id: (item as CombinedExpense).friend_expense_id,
                                    expense_name: (item as CombinedExpense).expense_name,
                                    payer_id: (item as CombinedExpense).payer_id,
                                    total_amount: (item as CombinedExpense).total_amount,
                                    debtor_amount: (item as CombinedExpense).debtor_amount,
                                    createdAt: item.createdAt,
                                    updatedAt: item.updatedAt,
                                }}
                                isCurrentUserPayer={(item as CombinedExpense).payer_id === user?.user_id}
                                currentUserImageUrl={user?.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                                imageUrl={friend?.friend.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                                name={friend?.friend.first_name!}
                            />
                        )}
                    </div>
                ))}
            </div>}
            {currentView === "Expenses" && <div className="space-y-2">
                {expenses.map((expense, index) => (
                    <div>
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
                    </div>
                ))}
            </div>}
            {currentView === "Messages" && <div className="space-y-2">
                {messages.map((message, index) => (
                    <div>
                        <MessageItem
                            key={index}
                            message={{
                                message: message.message,
                                createdAt: message.createdAt,
                                updatedAt: message.updatedAt
                            }}
                            isCurrentUser={message.sender_id === user?.user_id}
                            currentUserImageUrl={user?.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                            imageUrl={friend?.friend.image_url || "https://randomuser.me/api/portraits/men/9.jpg"}
                            name={friend?.friend.first_name!}
                        />
                    </div>
                ))}
            </div>}
        </div>
    );
};

export default ChatWindow;
