import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
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
import {
  CombinedViewType,
  isCombinedExpense,
  isCombinedGroupExpense,
  isCombinedGroupMessage,
  isCombinedGroupSettlement,
  isCombinedMessage,
} from "../utils/getCombinedItemType";

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
  const scrollPosition = useRef(0);
  const firstLoad = useRef(true);
  const prevView = useRef<"All" | "Expenses" | "Messages" | null>(null);
  const isFetching = useRef(false);
  const isResettingChat = useRef(false);

  const prevFriendsMessages = useRef(messages ?? []);
  const prevFriendsExpenses = useRef(expenses ?? []);
  const prevGroupsMessages = useRef(groupMessages ?? []);
  const prevGroupsExpenses = useRef(groupExpenses ?? []);
  const prevCombined = useRef(combinedView ?? []);

  //   useEffect(() => {
  //     const isFriend = isFriendsConversation(chat!);
  //     const messageHandler = (message: MessageData | GroupMessageData) => {
  //       const messageWithTime = {
  //         ...message,
  //         createdAt: new Date().toISOString(),
  //       };

  //       if (isFriend) {
  //         setMessages && setMessages((prev) => [...prev, messageWithTime as MessageData]);
  //       } else {
  //         setGroupMessages && setGroupMessages((prev) => [
  //           ...prev,
  //           messageWithTime as GroupMessageData,
  //         ]);
  //       }

  //       setCombinedView((prev) => [
  //         ...prev,
  //         { ...messageWithTime, type: "message" },
  //       ]);
  //     };

  //     if (isFriend) {
  //       onNewConversationMessage(messageHandler as (m: MessageData) => void);
  //     } else {
  //       onNewGroupMessage(messageHandler as (m: GroupMessageData) => void);
  //     }

  //     return () => {
  //       console.log("ran")
  //       removeNewMessageListener();
  //     };
  //   },
  // [onNewConversationMessage]); // more stable than function deps

  let content;

  const clearSelectedChat = () => {
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
        requestAnimationFrame(() => {
          if (messageContainerRef.current) {
            const newScrollHeight = messageContainerRef.current.scrollHeight;

            const scrollDiff = newScrollHeight - scrollPosition.current;
            messageContainerRef.current.scrollTop = scrollDiff - 100; 
          }
        })
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
          } else if (isCombinedGroupMessage(combined)) {
            return {
              ...combined,
              sender: enrichWithPayerDebtor(groupMembers!, combined.sender_id),
            };
          }
          return combined;
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
        requestAnimationFrame(() => {
          if (messageContainerRef.current) {
            const newScrollHeight = messageContainerRef.current.scrollHeight;

            const scrollDiff = newScrollHeight - scrollPosition.current;
            messageContainerRef.current.scrollTop = scrollDiff - 100; 
          }
        });
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
          scrollPosition.current =
            messageContainerRef.current?.scrollHeight || 0;
        }
      },
      { root: null, threshold: 1.0 }
    );

    observer.current.observe(messagesStartRef.current);

    return () => observer.current?.disconnect();
  }, [timestampCombined, timestampExpenses, timestampMessages, currentView]);

  useLayoutEffect(() => {
    // Trigger only on first load or view change with loaded data
    if (
      (firstLoad.current || prevView.current !== currentView) &&
      ((messages && messages.length > 0) ||
        (expenses && expenses.length > 0) ||
        (groupMessages && groupMessages.length > 0) ||
        (groupExpenses && groupExpenses.length > 0) ||
        combinedView.length > 0)
    ) {
      scrollToBottom();
      firstLoad.current = false;
      prevView.current = currentView;
    }
  }, [
    currentView,
    messages,
    expenses,
    groupMessages,
    groupExpenses,
    combinedView,
  ]);

  useLayoutEffect(() => {
    const checkAndScroll = (newItems: any[], prevRef: any) => {
      if (
        newItems &&
        newItems[0] &&
        prevRef.current[0] &&
        newItems[0].createdAt > prevRef.current[0].createdAt
      ) {
        prevRef.current = newItems;
        scrollToBottom();
      }
    };

    checkAndScroll(messages ?? [], prevFriendsMessages);
    checkAndScroll(expenses ?? [], prevFriendsExpenses);
    checkAndScroll(groupMessages ?? [], prevGroupsMessages);
    checkAndScroll(groupExpenses ?? [], prevGroupsExpenses);
    checkAndScroll(combinedView, prevCombined);
  }, [messages, expenses, groupMessages, groupExpenses, combinedView]);

  switch (currentView) {
    case "All":
      content = (
        <div className="space-y-2">
          {combinedView.map((item, index) => {
            if (isCombinedMessage(item)) {
              const isCurrentUser = item.sender_id === user?.user_id;
              const nextMessage = combinedView[index + 1];
              const nextIsSameUser =
                nextMessage && isCombinedMessage(nextMessage)
                  ? nextMessage?.sender_id === item.sender_id
                  : false;
              return (
                <MessageItem
                  key={index}
                  message={{
                    message: item.message,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  isCurrentUser={isCurrentUser}
                  currentUserImageUrl={user?.image_url || "/profile.png"}
                  imageUrl={
                    (chat as FriendData).friend.image_url || "/profile.png"
                  }
                  name={(chat as FriendData).friend.first_name!}
                  showAvatar={!nextIsSameUser} // Show avatar only if the next message is from a different user
                />
              );
            } else if (isCombinedExpense(item)) {
              const isCurrentUser = isUserPayer(user?.user_id!, item.payer_id);
              const nextExpense = combinedView[index + 1];
              const nextIsSameUser =
                nextExpense && isCombinedExpense(nextExpense)
                  ? nextExpense.payer_id === item.payer_id
                  : false;
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
                  isCurrentUserPayer={isCurrentUser}
                  currentUserImageUrl={user?.image_url || "/profile.png"}
                  imageUrl={
                    isFriendsConversation(chat!)
                      ? chat?.friend.image_url
                      : chat?.image_url || "/profile.png"
                  }
                  name={
                    isFriendsConversation(chat!)
                      ? chat?.friend.first_name!
                      : chat?.group_name!
                  }
                  showAvatar={!nextIsSameUser}
                />
              );
            } else if (isCombinedGroupMessage(item)) {
              const isCurrentUser =
                item.sender_id === currentMember?.group_membership_id;
              const nextMessage = combinedView[index + 1];
              const nextIsSameUser =
                nextMessage && isCombinedGroupMessage(nextMessage)
                  ? nextMessage?.sender_id === item.sender_id
                  : false;
              return (
                <MessageItem
                  key={index}
                  message={{
                    message: item.message,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  isCurrentUser={isCurrentUser}
                  currentUserImageUrl={
                    currentMember?.image_url || "/profile.png"
                  }
                  imageUrl={
                    groupMembers?.find(
                      (member) => member.group_membership_id === item.sender_id
                    )?.image_url || "/profile.png"
                  }
                  name={
                    groupMembers?.find(
                      (member) => member.group_membership_id === item.sender_id
                    )?.first_name!
                  }
                  showAvatar={!nextIsSameUser} // Show avatar only if the next message is from a different user
                />
              );
            } else if (isCombinedGroupExpense(item)) {
              const isCurrentUser = isUserPayer(
                currentMember?.group_membership_id!,
                item.payer_id
              );
              const nextExpense = combinedView[index + 1];
              const nextIsSameUser =
                nextExpense && isCombinedGroupExpense(nextExpense)
                  ? nextExpense.payer_id === item.payer_id
                  : false;
              return (
                <ExpenseItem
                  key={index}
                  expense={{
                    expense_id: item.group_expense_id,
                    expense_name: item.expense_name,
                    payer_id: item.payer_id,
                    total_amount: item.total_amount,
                    debtor_amount: isCurrentUser
                      ? item.total_debt_amount
                      : item.user_debt,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                  }}
                  isCurrentUserPayer={isCurrentUser}
                  currentUserImageUrl={user?.image_url || "/profile.png"}
                  imageUrl={item.payer.imageUrl || "/profile.png"}
                  name={item.payer.fullName || "Unknown Payer"}
                  showAvatar={!nextIsSameUser}
                />
              );
            } else if (isCombinedGroupSettlement(item)) {
              const nextExpense = combinedView[index + 1];
              const nextIsSameUser =
                nextExpense && isCombinedGroupSettlement(nextExpense)
                  ? nextExpense.payer_id === item.payer_id
                  : false;
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
                  currentUserImageUrl={user?.image_url || "/profile.png"}
                  payerName={item.payer.fullName || "Unknown Payer"}
                  payerImageUrl={item.payer.imageUrl || "/profile.png"}
                  debtorName={item.debtor.fullName || "Unknown Debtor"}
                  debtorImageUrl={item.debtor.imageUrl || "/profile.png"}
                  showAvatar={!nextIsSameUser}
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
            {expenses!.map((expense, index) => {
              const isCurrentUser = isUserPayer(
                user?.user_id!,
                expense.payer_id
              );
              const nextExpense = combinedView[index + 1];
              const nextIsSameUser =
                nextExpense && isCombinedExpense(nextExpense)
                  ? nextExpense.payer_id === expense.payer_id
                  : false;
              return (
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
                  isCurrentUserPayer={isCurrentUser}
                  currentUserImageUrl={user?.image_url || "/profile.png"}
                  imageUrl={chat?.friend.image_url || "/profile.png"}
                  name={chat?.friend.first_name!}
                  showAvatar={!nextIsSameUser}
                />
              );
            })}
          </div>
        );
      } else {
        content = (
          <div className="space-y-2">
            {groupExpenses!.map((expense, index) => {
              if (isGroupExpense(expense)) {
                const isCurrentUser = isUserPayer(
                  currentMember?.group_membership_id!,
                  expense.payer_id
                );
                const nextExpense = combinedView[index + 1];
                const nextIsSameUser =
                  nextExpense && isCombinedGroupExpense(nextExpense)
                    ? nextExpense.payer_id === expense.payer_id
                    : false;
                return (
                  <ExpenseItem
                    key={index}
                    expense={{
                      expense_id: expense.group_expense_id,
                      expense_name: expense.expense_name,
                      payer_id: expense.payer_id,
                      total_amount: expense.total_amount,
                      debtor_amount: isCurrentUser
                        ? expense.total_debt_amount
                        : expense.user_debt,
                      createdAt: expense.createdAt,
                      updatedAt: expense.updatedAt,
                    }}
                    isCurrentUserPayer={isCurrentUser}
                    currentUserImageUrl={user?.image_url || "/profile.png"}
                    imageUrl={expense.payer.imageUrl || "/profile.png"}
                    name={expense.payer.fullName || "Unknown Payer"}
                    showAvatar={!nextIsSameUser}
                  />
                );
              } else {
                const nextExpense = combinedView[index + 1];
                const nextIsSameUser =
                  nextExpense && isCombinedGroupSettlement(nextExpense)
                    ? nextExpense.payer_id === expense.payer_id
                    : false;
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
                    currentUserImageUrl={user?.image_url || "/profile.png"}
                    payerName={expense.payer.fullName || "Unknown Payer"}
                    payerImageUrl={expense.payer.imageUrl || "/profile.png"}
                    debtorName={expense.debtor.fullName || "Unknown Debtor"}
                    debtorImageUrl={expense.debtor.imageUrl || "/profile.png"}
                    showAvatar={!nextIsSameUser}
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
                const isCurrentUser = message.sender_id === user?.user_id;
                const nextMessage = messages![index + 1];
                const nextIsSameUser =
                  nextMessage?.sender_id === message.sender_id;
                return (
                  <MessageItem
                    key={index}
                    message={{
                      message: message.message,
                      createdAt: message.createdAt,
                      updatedAt: message.updatedAt,
                    }}
                    isCurrentUser={isCurrentUser}
                    currentUserImageUrl={user?.image_url || "/profile.png"}
                    imageUrl={chat?.friend.image_url || "/profile.png"}
                    name={chat?.friend.first_name!}
                    showAvatar={!nextIsSameUser} // Show avatar only if the next message is from a different user
                  />
                );
              })}
            </div>
          ))
        : (content = (
            <div className="space-y-2">
              {groupMessages!.map((message, index) => {
                const isCurrentUser =
                  message.sender_id === currentMember?.group_membership_id;
                const nextMessage = groupMessages![index + 1];
                const nextIsSameUser =
                  nextMessage?.sender_id === message.sender_id;
                return (
                  <MessageItem
                    key={index}
                    message={{
                      message: message.message,
                      createdAt: message.createdAt,
                      updatedAt: message.updatedAt,
                    }}
                    isCurrentUser={isCurrentUser}
                    currentUserImageUrl={
                      currentMember?.image_url || "/profile.png"
                    }
                    imageUrl={
                      groupMembers?.find(
                        (member) =>
                          member.group_membership_id === message.sender_id
                      )?.image_url || "/profile.png"
                    }
                    name={
                      groupMembers?.find(
                        (member) =>
                          member.group_membership_id === message.sender_id
                      )?.first_name!
                    }
                    showAvatar={!nextIsSameUser} // Show avatar only if the next message is from a different user
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
