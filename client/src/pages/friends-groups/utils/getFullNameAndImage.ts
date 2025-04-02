const getFullNameAndImage = (
  user: User | AddedFriend | GroupMemberData | undefined
) => ({
  fullName: `${user?.first_name} ${user?.last_name ?? ""}`.trim(),
  imageUrl: user?.image_url,
});

export default getFullNameAndImage;
