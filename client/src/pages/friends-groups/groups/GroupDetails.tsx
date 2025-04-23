import React, { useState, useEffect } from "react";
import { Button, CircularProgress, IconButton } from "@mui/material";
import {
  Edit,
  ArrowBack,
  CheckCircleRounded,
  AccountBalance,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Settlement from "../components/Settlement";
import { toast } from "sonner";
import getFullNameAndImage from "../utils/getFullNameAndImage";
import CreateGroup from "./CreateGroup";

const getSettleUpStatus = (balance: string) => {
  if (parseFloat(balance) === 0) {
    return true;
  }
  return false;
};

interface GroupDetailPageProps {
  selectedGroup: GroupData | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<GroupData | null>>;
  groupMembers: GroupMemberData[];
  setGroupMembers: React.Dispatch<React.SetStateAction<GroupMemberData[]>>;
  currentMember: GroupMemberData | null;
  setGroupExpenses: React.Dispatch<
    React.SetStateAction<(GroupExpenseData | GroupSettlementData)[]>
  >;
  setCombinedView: React.Dispatch<
    React.SetStateAction<
      (
        | CombinedMessage
        | CombinedExpense
        | CombinedGroupMessage
        | CombinedGroupExpense
        | CombinedGroupSettlement
      )[]
    >
  >;
  setChats: React.Dispatch<React.SetStateAction<FriendData[] | GroupData[]>>;
}

const GroupDetailPage: React.FC<GroupDetailPageProps> = ({
  selectedGroup,
  setSelectedGroup,
  groupMembers,
  setGroupMembers,
  currentMember,
  setGroupExpenses,
  setCombinedView,
  setChats,
}) => {
  const navigate = useNavigate();

  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [settlementPayer, setSettlementPayer] = useState<{
    fullName: string;
    imageUrl: string;
    payerId: string;
  }>();
  const [settlementDebtor, setSettlementDebtor] = useState<{
    fullName: string;
    imageUrl: string;
    debtorId: string;
  }>();
  const [settlementAmount, setSettlementAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
//   const [settlementLoading, setSettlementLoading] = useState(false);

  useEffect(() => {
    if (!selectedGroup) navigate("/groups");
  }, [selectedGroup, navigate]);

  const handleSettleBalance = (memberId: string) => {
    // Placeholder for settle balance logic
    const memberToSettle = groupMembers.find(
      (member) => memberId === member.group_membership_id
    );

    // Check if balance is already settled up
    if (getSettleUpStatus(memberToSettle!.balance_with_user)) {
      toast.info("You are already settled up");
      return;
    }
    const settlementAmount = Math.abs(
      parseFloat(memberToSettle!.balance_with_user)
    );

    // Determine whether the currentMember is the payer
    const isPayer = parseFloat(memberToSettle!.balance_with_user) > 0;

    const payerId = isPayer
      ? currentMember!.group_membership_id
      : memberToSettle?.group_membership_id;
    const debtorId = isPayer
      ? memberToSettle?.group_membership_id
      : currentMember!.group_membership_id;

    // Assign payer and debtor details using destructuring
    const { fullName: payerName, imageUrl: payerImage } = isPayer
      ? getFullNameAndImage(currentMember!) // Current member is the payer
      : getFullNameAndImage(memberToSettle); // Other member is the payer

    const { fullName: debtorName, imageUrl: debtorImage } = isPayer
      ? getFullNameAndImage(memberToSettle) // Other member is the debtor
      : getFullNameAndImage(currentMember!); // Current member is the debtor

    setSettlementPayer({
      fullName: payerName,
      imageUrl: payerImage,
      payerId: payerId!,
    });
    setSettlementDebtor({
      fullName: debtorName,
      imageUrl: debtorImage,
      debtorId: debtorId!,
    });
    setSettlementAmount(settlementAmount);
    setSettleDialogOpen(true);
  };

  const handleUpdateGroup = () => {
    setLoading(true);
    setEditGroupDialogOpen(true);
  };

  const handleUpdateGroupClose = () => {
    setLoading(false);
    setEditGroupDialogOpen(false);
  };

  return (
    <>
      <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedGroup && (
            <div className="max-w-4xl mx-auto">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden group">
                    <img
                      src={selectedGroup.image_url || "/default-group.png"}
                      alt="Group"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div
                      onClick={handleUpdateGroup}
                      className="absolute w-16 h-16 inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 cursor-pointer"
                    >
                      <Edit color="inherit" fontSize="small" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold">
                        {selectedGroup.group_name}
                      </h1>
                      <IconButton onClick={handleUpdateGroup}>
                      {!loading ? (<Edit fontSize="small" />) : <CircularProgress />}
                      </IconButton>
                    </div>
                    {selectedGroup.group_description && (
                      <p className="text-gray-500">
                        {selectedGroup.group_description}
                      </p>
                    )}
                    <p className="text-gray-500">
                      {groupMembers.length} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Box */}
              {currentMember && (
                <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                  {parseFloat(currentMember.total_balance) > 0 ? (
                    <p className="text-green-600 font-large">
                      You are owed ₹{currentMember.total_balance}
                    </p>
                  ) : parseFloat(currentMember.total_balance) < 0 ? (
                    <p className="text-red-600 font-large">
                      You owe ₹
                      {Math.abs(
                        parseFloat(currentMember.total_balance)
                      ).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-gray-600">You're all settled up!</p>
                  )}
                </div>
              )}

              {/* Members Table */}
              <div className="overflow-x-auto border rounded-lg max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Member</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Balance with You</th>
                      <th className="text-left p-3">Balance in Group</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupMembers.map((member) => (
                      <tr key={member.group_membership_id} className="border-t">
                        <td className="p-3">
                          {`${member.first_name} ${
                            member.last_name ?? ""
                          }`.trim()}
                          {member.deletedAt && (
                            <span className="text-red-600 font-semibold">
                              (Left)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {member.role === "USER"
                            ? "Member"
                            : member.role[0] +
                              member.role.slice(1).toLowerCase()}
                        </td>
                        <td className="p-3">
                          {member.group_membership_id ===
                            currentMember?.group_membership_id ||
                          member.deletedAt ? (
                            <span className="text-gray-600">--</span>
                          ) : parseFloat(member.balance_with_user) >= 0 ? (
                            <span className="text-green-600">
                              ₹{parseFloat(member.balance_with_user).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              ₹
                              {Math.abs(
                                parseFloat(member.balance_with_user)
                              ).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {member.deletedAt ? (
                            <span className="text-gray-600">--</span>
                          ) : parseFloat(member.total_balance) >= 0 ? (
                            <span className="text-green-600">
                              ₹{parseFloat(member.total_balance).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              ₹
                              {Math.abs(
                                parseFloat(member.total_balance)
                              ).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {member.group_membership_id ===
                          currentMember?.group_membership_id ? (
                            <span className="text-gray-600">--</span>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                handleSettleBalance(member.group_membership_id)
                              }
                              className="flex items-center gap-1"
                            >
                              {parseFloat(member.balance_with_user) === 0 ? (
                                <CheckCircleRounded fontSize="small" />
                              ) : (
                                <AccountBalance fontSize="small" />
                              )}
                              {parseFloat(member.balance_with_user) === 0
                                ? "All Clear"
                                : "Settle Up"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-4">
                <Button
                  onClick={() => navigate("/groups")}
                  className="flex items-center gap-1"
                  variant="outlined"
                >
                  <ArrowBack fontSize="small" /> Back
                </Button>
              </div>

              {/* Settle Dialog */}
              <Settlement
                open={settleDialogOpen}
                handleSettlementClose={() => setSettleDialogOpen(false)}
                chat={selectedGroup}
                setChats={setChats}
                setGroupMembers={setGroupMembers}
                setGroupExpenses={setGroupExpenses}
                setCombinedView={setCombinedView}
                currentMember={currentMember!}
                groupPayer={settlementPayer}
                groupDebtor={settlementDebtor}
                totalAmount={settlementAmount}
              />
            </div>
          )}
        </div>
      </div>
      <CreateGroup
        open={editGroupDialogOpen}
        chat={selectedGroup!}
        handleClose={handleUpdateGroupClose}
        title="Update Group"
        setGroups={(groups) => setChats(groups as GroupData[])}
        selectedGroup={selectedGroup!}
        setSelectedGroup={setSelectedGroup}
      />
    </>
  );
};

export default GroupDetailPage;
