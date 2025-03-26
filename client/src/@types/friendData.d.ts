interface AddedFriend {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    image_url: string;
}

interface FriendData {
    conversation_id: string;
    status: string;
    balance_amount: string;
    archival_status: string;
    block_status: string;
    friend: AddedFriend;
}

interface Friend {
    success: string;
    message: string;
    data: FriendData[];
}

interface ExpenseData {
    createdAt: string;
    debtor_amount: string;
    debtor_id: string;
    deletedAt: string | null;
    conversation_id: string;
    description: string;
    expense_name: string;
    friend_expense_id: string;
    payer_id: string;
    receipt_url: string | null;
    split_type: string;
    total_amount: string;
    updatedAt: string;
    payer: string;
}