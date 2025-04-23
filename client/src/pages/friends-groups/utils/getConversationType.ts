const isFriendsConversation = (
  item: FriendData | GroupData
): item is FriendData => {
  return (item as FriendData).conversation_id !== undefined;
};

export default isFriendsConversation;
