import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchMessagesAndExpenses } from "../friends/services";
import ExpenseItem from "./Expense";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { LinearProgress } from "@mui/material";
import useScrollToBottom from "../hooks/useScrollToBottom";
import MessageItem from "./Message";
import { toast } from "sonner";
import isFriendsConversation from "../utils/getConversationType";
import { fetchMessagesExpensesAndSettlements } from "../groups/services";
import {
  isGroupExpense,
  isGroupOrFriendsExpense,
} from "../utils/getExpenseType";
import isUserPayer from "../utils/getGroupPayer";
import SettlementDisplay from "./SettlementDisplay";
import enrichWithPayerDebtor from "../utils/getPayerDebtorData";
import { useSocket } from "../hooks/useSocket";
import { CombinedViewType, isCombinedExpense, isCombinedGroupExpense, isCombinedGroupSettlement, isCombinedMessage } from "../utils/getCombinedItemType";

interface ChatWindowProp {
  currentView: "All" | "Expenses" | "Messages";
  chat: FriendData | GroupData | null;
  messages?: MessageData[];
  expenses?: ExpenseData[];
  groupMessages?: GroupMessageData[];
  groupExpenses?: (GroupExpenseData | GroupSettlementData)[];
  combinedView: CombinedViewType[];
  setMessages?: React.Dispatch<React.SetStateAction<MessageData[]>>;
  setExpenses?: React.Dispatch<React.SetStateAction<ExpenseData[]>>;
  setGroupMessages?: React.Dispatch<React.SetStateAction<GroupMessageData[]>>;
  setGroupExpenses?: React.Dispatch<
    React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>
  >;
  setCombinedView: React.Dispatch<React.SetStateAction<CombinedViewType[]>>;
  groupMembers?: GroupMemberData[];
  currentMember?: GroupMemberData;
}

const PAGE_SIZE = 20;

const ChatWindow: React.FC<ChatWindowProp> = ({
  currentView,
  chat,
  messages,
  expenses,
  groupMessages,
  groupExpenses,
  combinedView,
  setMessages,
  setExpenses,
  setGroupMessages,
  setGroupExpenses,
  setCombinedView,
  groupMembers,
  currentMember,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [allExpensesLoaded, setAllExpensesLoaded] = useState(false);
  const [allCombinedLoaded, setAllCombinedLoaded] = useState(false);

  const [timestampMessages, setTimestampMessages] = useState<string>(
    new Date().toISOString()
  );
  const [timestampExpenses, setTimestampExpenses] = useState<string>(
    new Date().toISOString()
  );
  const [timestampCombined, setTimestampCombined] = useState<string>(
    new Date().toISOString()
  );

  const messagesStartRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const { messageContainerRef, scrollToBottom } = useScrollToBottom();
  const previousScrollHeight = useRef(0);
  const previousScrollTop = useRef(0);
  const firstLoad = useRef(true);
  const prevView = useRef<"All" | "Expenses" | "Messages" | null>(null);
  const isFetching = useRef(false);
  const isResettingChat = useRef(false);

  const prevFriendsMessages = useRef(messages ?? []);
  const prevFriendsExpenses = useRef(expenses ?? []);
  const prevGroupsMessages = useRef(groupMessages ?? []);
  const prevGroupsExpenses = useRef(groupExpenses ?? []);
  const prevCombined = useRef(combinedView ?? []);
  const { leaveRoom } = useSocket();

  let content;

  const clearSelectedChat = () => {
    leaveRoom(
      isFriendsConversation(chat!) ? chat.conversation_id : chat?.group_id!
    );
    isResettingChat.current = true;
    setMessages && setMessages([]);
    setExpenses && setExpenses([]);
    setGroupMessages && setGroupMessages([]);
    setGroupExpenses && setGroupExpenses([]);
    setCombinedView([]);
    setAllMessagesLoaded(false);
    setAllExpensesLoaded(false);
    setAllCombinedLoaded(false);
    setTimestampMessages(new Date().toISOString());
    setTimestampExpenses(new Date().toISOString());
    setTimestampCombined(new Date().toISOString());
    setTimeout(() => {
      isResettingChat.current = false; // Enable fetching again after reset
    }, 10);
  };
  useEffect(() => {
    if (!chat) return;
    clearSelectedChat();
  }, [chat]);
  // 🔹 Function to check if all items are loaded
  const checkAndSetLoaded = (
    type: "messages" | "expenses" | "combined",
    newData: any[],
    pageSize: number
  ) => {
    if (newData.length < pageSize) {
      if (type === "messages") setAllMessagesLoaded(true);
      if (type === "expenses") setAllExpensesLoaded(true);
      if (type === "combined") setAllCombinedLoaded(true);
    }
  };

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
      if (isFriendsConversation(chat!)) {
        const response: FetchResult = await fetchMessagesAndExpenses(
          chat?.conversation_id!,
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

        if (setMessages) setMessages((prev) => [...newMessages, ...prev]);
        if (setExpenses) setExpenses((prev) => [...newExpenses, ...prev]);
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
        if (newMessages.length)
          setTimestampMessages(() => newMessages[0].createdAt);
        if (newExpenses.length)
          setTimestampExpenses(() => newExpenses[0].createdAt);
        if (newCombined.length)
          setTimestampCombined(() => newCombined[0].createdAt);

        // 🔹 Restore scroll position after the DOM updates
        setTimeout(() => {
          if (messageContainerRef.current) {
            const newScrollHeight = messageContainerRef.current.scrollHeight;

            messageContainerRef.current.scrollTop =
              newScrollHeight -
              previousScrollHeight.current +
              previousScrollTop.current;

            // Update for the next turn
            previousScrollHeight.current =
              messageContainerRef.current.scrollHeight;
            previousScrollTop.current = messageContainerRef.current.scrollTop;
          }
        }, 0);
      } else {
        const response = await fetchMessagesExpensesAndSettlements(
          chat?.group_id!,
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

        const newExpensesWithPayer = newExpenses.map((expense) => {
          if (isGroupOrFriendsExpense(expense)) {
            if (isGroupExpense(expense)) {
              return {
                ...expense,
                payer: enrichWithPayerDebtor(groupMembers!, expense.payer_id),
              };
            } else {
              return {
                ...expense,
                payer: enrichWithPayerDebtor(groupMembers!, expense.payer_id),
                debtor: enrichWithPayerDebtor(groupMembers!, expense.debtor_id),
              };
            }
          }
          return expense;
        });

        const newCombinedWithPayer = newCombined.map((combined) => {
          if (isCombinedGroupExpense(combined)) {
            return {
              ...combined,
              payer: enrichWithPayerDebtor(groupMembers!, combined.payer_id),
            };
          } else if (isCombinedGroupSettlement(combined)) {
            return {
              ...combined,
              payer: enrichWithPayerDebtor(groupMembers!, combined.payer_id),
              debtor: enrichWithPayerDebtor(groupMembers!, combined.debtor_id),
            };
          }
        });

        // 🔹 Prepend old messages for infinite scrolling

        if (setGroupMessages)
          setGroupMessages((prev) => [...newMessages, ...prev]);
        if (setGroupExpenses)
          setGroupExpenses((prev) => [...newExpensesWithPayer, ...prev]);
        setCombinedView((prev) => [
          ...newCombinedWithPayer.filter((item) => item !== undefined),
          ...prev,
        ]);

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
        if (newMessages.length)
          setTimestampMessages(() => newMessages[0].createdAt);
        if (newExpenses.length)
          setTimestampExpenses(() => newExpenses[0].createdAt);
        if (newCombined.length)
          setTimestampCombined(() => newCombined[0].createdAt);

        // 🔹 Restore scroll position after the DOM updates
        if (messageContainerRef.current) {
          const newScrollHeight = messageContainerRef.current.scrollHeight;

          messageContainerRef.current.scrollTop =
            newScrollHeight -
            previousScrollHeight.current +
            previousScrollTop.current;

          // Update for the next turn
          previousScrollHeight.current =
            messageContainerRef.current.scrollHeight;
          previousScrollTop.current = messageContainerRef.current.scrollTop;
        }
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again later.");
    } finally {
      isFetching.current = false;
      setLoading((prevLoading) => {
        if (!prevLoading) return prevLoading; // Prevent unnecessary updates
        return false;
      });
    }
  }, [
    chat,
    timestampMessages,
    timestampExpenses,
    timestampCombined,
    checkAndSetLoaded,
    currentView,
    groupMembers,
  ]);

  // 🔹 Infinite Scroll Observer
  useEffect(() => {
    if (!messagesStartRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isResettingChat.current) {
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
      if (
        (messages && messages.length > 0) ||
        (expenses && expenses.length > 0) ||
        (groupMessages && groupMessages.length > 0) ||
        (groupExpenses && groupExpenses.length > 0) ||
        combinedView.length > 0
      ) {
        scrollToBottom();
        firstLoad.current = false;
        prevView.current = currentView; // update prevView after data loads
      }
    }
  }, [currentView]);

  useEffect(() => {
    // Check for new messages
    if (
      messages &&
      messages[0] &&
      prevFriendsMessages.current[0] &&
      messages[0].createdAt > prevFriendsMessages.current[0].createdAt
    ) {
      prevFriendsMessages.current = messages;
      scrollToBottom();
    }
    if (
      expenses &&
      expenses[0] &&
      prevFriendsExpenses.current[0] &&
      expenses[0].createdAt > prevFriendsExpenses.current[0].createdAt
    ) {
      prevFriendsExpenses.current = expenses;
      scrollToBottom();
    }
    if (
      groupMessages &&
      groupMessages[0] &&
      prevGroupsMessages.current[0] &&
      groupMessages[0].createdAt > prevGroupsMessages.current[0].createdAt
    ) {
      prevGroupsMessages.current = groupMessages;
      scrollToBottom();
    }
    if (
      groupExpenses &&
      groupExpenses[0] &&
      prevGroupsExpenses.current[0] &&
      groupExpenses[0].createdAt > prevGroupsExpenses.current[0].createdAt
    ) {
      prevGroupsExpenses.current = groupExpenses;
      scrollToBottom();
    }
    if (
      combinedView[0] &&
      prevCombined.current[0] &&
      combinedView[0].createdAt > prevCombined.current[0].createdAt
    ) {
      prevCombined.current = combinedView;
      scrollToBottom();
    }
  }, [
    messages,
    expenses,
    groupMessages,
    groupExpenses,
    combinedView,
    scrollToBottom,
  ]);

  switch (currentView) {
    case "All":
      content = (
        <div className="space-y-2">
          {combinedView.map((item, index) => {
            if (isCombinedMessage(item)) {
              return (
                <MessageItem
                  key={index}
                  message={{
                    message: item.message,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  isCurrentUser={
                    isFriendsConversation(chat!)
                      ? item.sender_id === user?.user_id
                      : item.sender_id === currentMember?.group_membership_id
                  }
                  currentUserImageUrl={
                    user?.image_url ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  imageUrl={
                    isFriendsConversation(chat!)
                      ? chat?.friend.image_url
                      : groupMembers?.find(
                          (member) =>
                            member.group_membership_id === item.sender_id
                        )?.image_url ||
                        "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  name={
                    isFriendsConversation(chat!)
                      ? chat?.friend.first_name!
                      : groupMembers?.find(
                          (member) =>
                            member.group_membership_id === item.sender_id
                        )?.first_name!
                  }
                />
              );
            } else if (isCombinedExpense(item)) {
              return (
                <ExpenseItem
                  key={index}
                  expense={{
                    expense_id: item.friend_expense_id,
                    expense_name: item.expense_name,
                    payer_id: item.payer_id,
                    total_amount: item.total_amount,
                    debtor_amount: item.debtor_amount,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  isCurrentUserPayer={isUserPayer(user?.user_id!, item.payer_id)}
                  currentUserImageUrl={
                    user?.image_url ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  imageUrl={
                    isFriendsConversation(chat!)
                      ? chat?.friend.image_url
                      : chat?.image_url ||
                        "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  name={
                    isFriendsConversation(chat!)
                      ? chat?.friend.first_name!
                      : chat?.group_name!
                  }
                />
              );
            } else if (isCombinedGroupExpense(item)) {
              return (
                <ExpenseItem
                  key={index}
                  expense={{
                    expense_id: item.group_expense_id,
                    expense_name: item.expense_name,
                    payer_id: item.payer_id,
                    total_amount: item.total_amount,
                    debtor_amount: isUserPayer(currentMember?.group_membership_id!, item.payer_id)
                      ? item.total_debt_amount
                      : item.user_debt,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  isCurrentUserPayer={
                    isUserPayer(currentMember?.group_membership_id!, item.payer_id)
                  }
                  currentUserImageUrl={
                    user?.image_url ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  imageUrl={
                    item.payer.imageUrl ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  name={item.payer.fullName || "Unknown Payer"}
                />
              );
            } else if (isCombinedGroupSettlement(item)) {
              return (
                <SettlementDisplay
                  key={index}
                  settlement={{
                    settlement_id: item.group_settlement_id,
                    settlement_amount: item.settlement_amount,
                    payerId: item.payer_id,
                    debtorId: item.debtor_id,
                    description: item.description,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  currentUserId={currentMember?.group_membership_id!}
                  currentUserImageUrl={
                    user?.image_url ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  payerName={item.payer.fullName || "Unknown Payer"}
                  payerImageUrl={
                    item.payer.imageUrl ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                  debtorName={item.debtor.fullName || "Unknown Debtor"}
                  debtorImageUrl={
                    item.debtor.imageUrl ||
                    "https://randomuser.me/api/portraits/men/9.jpg"
                  }
                />
              );
            }
          })}
        </div>
      );
      break;
    case "Expenses":
      if (isFriendsConversation(chat!)) {
        content = (
          <div className="space-y-2">
            {expenses!.map((expense, index) => (
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
                isCurrentUserPayer={isUserPayer(user?.user_id!, expense.payer_id)}
                currentUserImageUrl={
                  user?.image_url ||
                  "https://randomuser.me/api/portraits/men/9.jpg"
                }
                imageUrl={
                  chat?.friend.image_url ||
                  "https://randomuser.me/api/portraits/men/9.jpg"
                }
                name={chat?.friend.first_name!}
              />
            ))}
          </div>
        );
      } else {
        content = (
          <div className="space-y-2">
            {groupExpenses!.map((expense, index) => {
              if (isGroupExpense(expense)) {
                return (
                  <ExpenseItem
                    key={index}
                    expense={{
                      expense_id: expense.group_expense_id,
                      expense_name: expense.expense_name,
                      payer_id: expense.payer_id,
                      total_amount: expense.total_amount,
                      debtor_amount: isUserPayer(
                        currentMember?.group_membership_id!,
                        expense.payer_id
                      )
                        ? expense.total_debt_amount
                        : expense.user_debt,
                      createdAt: expense.createdAt,
                      updatedAt: expense.updatedAt,
                    }}
                    isCurrentUserPayer={
                      isUserPayer(currentMember?.group_membership_id!, expense.payer_id)
                    }
                    currentUserImageUrl={
                      user?.image_url ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    imageUrl={
                      expense.payer.imageUrl ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    name={expense.payer.fullName || "Unknown Payer"}
                  />
                );
              } else {
                return (
                  <SettlementDisplay
                    key={index}
                    settlement={{
                      settlement_id: expense.group_settlement_id,
                      settlement_amount: expense.settlement_amount,
                      payerId: expense.payer_id,
                      debtorId: expense.debtor_id,
                      description: expense.description,
                      createdAt: expense.createdAt,
                      updatedAt: expense.updatedAt,
                    }}
                    currentUserId={currentMember?.group_membership_id!}
                    currentUserImageUrl={
                      user?.image_url ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    payerName={expense.payer.fullName || "Unknown Payer"}
                    payerImageUrl={
                      expense.payer.imageUrl ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    debtorName={expense.debtor.fullName || "Unknown Debtor"}
                    debtorImageUrl={
                      expense.debtor.imageUrl ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                  />
                );
              }
            })}
          </div>
        );
      }
      break;
    case "Messages":
      isFriendsConversation(chat!)
        ? (content = (
            <div className="space-y-2">
              {messages!.map((message, index) => {
                return (
                  <MessageItem
                    key={index}
                    message={{
                      message: message.message,
                      createdAt: message.createdAt,
                      updatedAt: message.updatedAt,
                    }}
                    isCurrentUser={message.sender_id === user?.user_id}
                    currentUserImageUrl={
                      user?.image_url ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    imageUrl={
                      chat?.friend.image_url ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    name={chat?.friend.first_name!}
                  />
                );
              })}
            </div>
          ))
        : (content = (
            <div className="space-y-2">
              {groupMessages!.map((message, index) => {
                return (
                  <MessageItem
                    key={index}
                    message={{
                      message: message.message,
                      createdAt: message.createdAt,
                      updatedAt: message.updatedAt,
                    }}
                    isCurrentUser={message.sender_id === user?.user_id}
                    currentUserImageUrl={
                      user?.image_url ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    imageUrl={
                      groupMembers?.find(
                        (member) =>
                          member.group_membership_id === message.sender_id
                      )?.image_url ||
                      "https://randomuser.me/api/portraits/men/9.jpg"
                    }
                    name={
                      groupMembers?.find(
                        (member) =>
                          member.group_membership_id === message.sender_id
                      )?.first_name!
                    }
                  />
                );
              })}
            </div>
          ));
      break;
    default:
      break;
  }

  return (
    <div
      ref={messageContainerRef}
      className="min-h-[60vh] max-h-[60vh] overflow-y-auto"
    >
      <div ref={messagesStartRef}></div>
      {loading && <LinearProgress />}
      {/* Messages or Expenses go here */}
      {content}
    </div>
  );
};

export default ChatWindow;
