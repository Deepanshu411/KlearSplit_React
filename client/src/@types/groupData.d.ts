interface MembersData {
  members: [];
  admins: [];
  coadmins: [];
}

interface CreateGroupData {
  group: {
    group_name: string;
    group_description: string;
    image_url: string;
  };
  memberData: MembersData;
}

interface Group {
  group_id: string;
  group_name: string;
  group_description: string;
  image_url: string;
  creator_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface CreateGroupResponse {
  success: string;
  message: string;
  data: Group;
}

interface SearchedUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface SearchedUserResponse {
  success: string;
  message: string;
  data: SearchedUser[];
}

interface MemberData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
}

interface GroupMemberData {
  group_membership_id: string;
  group_id: string;
  inviter_id: string;
  member_id: string;
  status: string;
  role: string;
  has_archived: boolean;
  has_blocked: boolean;
  balance_with_user: string;
  total_balance: string;
  first_name: string;
  last_name: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GroupData {
  group_id: string;
  group_name: string;
  group_description: string;
  image_url: string;
  creator_id: string;
  balance_amount: string;
  status: string;
  role: string;
  has_blocked: boolean;
}

interface Groups {
  success: string;
  message: string;
  data: {
    invitedGroups: GroupData[];
    acceptedGroups: GroupData[];
  };
}

interface GroupResponse {
  success: string;
  message: string;
  data: GroupMemberData[];
}

interface UpdateGroupResponse {
  success: string;
  message: string;
  data: [number, [Group]];
}

interface UpdateMemberResponse {
  success: string;
  message: string;
  data: GroupMemberData;
}

interface GroupMessageData {
  group_message_id: string;
  group_id: string;
  sender_id: string;
  senderName: string;
  senderImage?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GroupMessageResponse {
  success: string;
  message: string;
  data: GroupMessageData[];
}

interface ExpenseParticipant {
  expense_participant_id: string;
  debtor_id: string;
  debtor_amount: string;
  group_expense_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GroupExpenseData {
  group_expense_id: string;
  group_id: string;
  expense_name: string;
  payer_id: string;
  total_amount: string;
  description: string | null;
  receipt_url: string | null;
  split_type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  payer: {
    fullName: string;
    imageUrl?: string;
  };
  total_debt_amount: string;
  user_debt: string;
  participants: ExpenseParticipant[];
}

interface GroupExpenseResponse {
  success: string;
  message: string;
  data: {
    expense: GroupExpenseData;
    expenseParticipants: ExpenseParticipant[];
  };
}

interface GroupSettlementData {
  group_settlement_id: string;
  settlement_amount: string;
  payer_id: string;
  debtor_id: string;
  group_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  description: string | null;
  payer: {
    fullName: string;
    imageUrl?: string;
  };
  debtor: {
    fullName: string;
    imageUrl?: string;
  };
}

interface GroupSettlementResponse {
  success: string;
  message: string;
  data: GroupSettlementData;
}

interface FetchExpenseResponse {
  success: string;
  message: string;
  data: (GroupExpenseData | GroupSettlementData)[];
}

interface Debtors {
  debtor_id: string;
  debtor_share: number;
}

interface GroupExpenseInput {
  expense_name: string;
  total_amount: number;
  payer_id: string;
  description?: string;
  split_type: string;
  payer_share: number;
  debtors: Debtors[];
}

interface GroupSettlementInput {
  payer_id: string;
  debtor_id: string;
  settlement_amount: number;
  description?: string;
}

interface CombinedGroupMessage extends GroupMessageData {
  type: string;
}

interface CombinedGroupExpense extends GroupExpenseData {
  type: string;
}

interface CombinedGroupSettlement extends GroupSettlementData {
  type: string;
}

interface CombinedView {
  success: string;
  message: string;
  data: (
    | CombinedGroupExpense
    | CombinedGroupSettlement
    | CombinedGroupMessage
  )[];
}

interface ExpenseDeletedEvent {
  id: string;
  payerId: string;
  debtorAmount: string;
}
