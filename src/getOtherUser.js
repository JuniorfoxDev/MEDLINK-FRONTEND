// src/utils/getOtherUser.js
export const getOtherUser = (chat, currentUser) => {
  if (!chat?.participants) return {};
  return (
    chat.participants.find(
      (p) =>
        (p._id?.toString() || p.id?.toString()) !==
        (currentUser?._id?.toString() || currentUser?.id?.toString())
    ) || {}
  );
};
