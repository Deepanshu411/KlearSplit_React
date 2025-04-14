const getFullNameAndImage = (
  user: User | AddedFriend | GroupMemberData | undefined
) => {
  return {fullName: `${user?.first_name} ${user?.last_name ?? ""}`.trim(),
  imageUrl: user?.image_url ?? "/static/images/avatar/1.jpg",}
};

export default getFullNameAndImage;
