import getFullNameAndImage from "./getFullNameAndImage";

const enrichWithPayerDebtor = (groupMembers: GroupMemberData[], id: string | number) => {
  const member = groupMembers.find(
    (member) => member.group_membership_id === id
  );
  return getFullNameAndImage(member);
};

export default enrichWithPayerDebtor;
