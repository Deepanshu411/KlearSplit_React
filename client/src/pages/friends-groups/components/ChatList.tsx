import { getBalanceAsNumber } from "../utils/getBalanceAsNumber.ts"; // Utility function for balance conversion

interface ChatListProps {
  friends: FriendData[];
  onSelectFriend: (friend: FriendData) => void;
}

const ChatList: React.FC<ChatListProps> = ({ friends, onSelectFriend }) => {
  return (
    <div className="flex flex-col justify-start items-center w-full min-h-[60vh] max-h-[60vh] overflow-y-auto">
      {friends.map((friend, index) => (
        <div key={index} className="flex flex-row items-center justify-between w-full p-4 cursor-pointer active:cursor-grabbing" onClick={() => onSelectFriend(friend)}>
          <div className="flex flex-row items-center gap-4 w-full">
            <img src={friend.friend.image_url || "https://randomuser.me/api/portraits/men/9.jpg"} alt={friend.friend.first_name} className="h-10 w-10 rounded-full" />
            <div className="flex flex-col">
              <h5 className="text-md font-semibold">{friend.friend.first_name} {friend.friend.last_name}</h5>
              <p className="text-sm">{friend.friend.email}</p>
            </div>
          </div>
          <h6 className={`text-md ${getBalanceAsNumber(friend.balance_amount) < 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{friend.balance_amount}
          </h6>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
