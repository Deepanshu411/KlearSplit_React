const isFriendsConversations = (
    item: FriendData[] | GroupData[]
  ): item is FriendData[] => {
    return item.length > 0 && (item as FriendData[])[0].conversation_id !== undefined;
  };
  
  export default isFriendsConversations;