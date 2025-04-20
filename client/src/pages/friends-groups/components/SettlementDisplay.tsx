import React from "react";
import { Avatar } from "@mui/material";
import formatTime from "../../../utils/formatTime";

interface GenericSettlement {
  settlement_id: string;
  settlement_amount: string;
  payerId: string;
  debtorId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SettlementDisplayProps {
  settlement: GenericSettlement;
  currentUserId: string;
  payerName: string;
  payerImageUrl: string;
  debtorName: string;
  debtorImageUrl: string;
  currentUserImageUrl: string;
}

const SettlementDisplay: React.FC<SettlementDisplayProps> = ({
  settlement,
  currentUserId,
  payerName,
  payerImageUrl,
  debtorName,
  currentUserImageUrl,
}) => {
  const isCurrentUserPayer = settlement.payerId === currentUserId;
  const isCurrentUserDebtor = settlement.debtorId === currentUserId;

  const getUserName = (name: string, role: "payer" | "debtor") => {
    if (
      (isCurrentUserPayer && role === "payer") ||
      (isCurrentUserDebtor && role === "debtor")
    ) {
      return "You";
    }
    return name;
  };

  return (
    <div
      className={`flex mb-2 px-2 ${
        isCurrentUserPayer ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUserPayer && (
        <Avatar
          src={payerImageUrl || "/profile.png"}
          alt="payer avatar"
          className="self-end me-3 shadow-md"
          sx={{ width: 40, height: 40 }}
        />
      )}

      <div
        className="flex flex-col items-start backdrop-blur-md max-w-[48vw] md:max-w-[34vw] lg:max-w-[28vw] rounded-2xl p-4 border-2 border-white/5 text-sm text-black bg-black/10 shadow-lg"
        
      >
        <div className="flex justify-between w-full mb-2">
          <div>
            <p className="mb-0 text-black">
              {`${getUserName(payerName, "payer")} paid ${getUserName(
                debtorName,
                "debtor"
              )} ₹${parseFloat(settlement.settlement_amount).toFixed(2)}`}
            </p>
            {settlement.description && (
              <p className="text-gray-600 mb-0 text-sm">
                {settlement.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center w-full text-sm text-gray-700">
          <span>{formatTime(settlement.createdAt)}</span>
        </div>
      </div>

      {isCurrentUserPayer && (
        <Avatar
          src={currentUserImageUrl || "/profile.png"}
          alt="your avatar"
          className="self-end ms-3 shadow-md"
          sx={{ width: 40, height: 40 }}
        />
      )}
    </div>
  );
};

export default SettlementDisplay;
