"use client";

export function normalizeSocketId(value) {
  if (value == null) return null;
  if (typeof value === "object") {
    return normalizeSocketId(value._id ?? value.id);
  }
  return String(value);
}

export function getSocketEventUserId(data) {
  return normalizeSocketId(
    data?.userId ??
      data?.user?._id ??
      data?.user?.id
  );
}

export function getSocketEventAstrologerId(data) {
  return normalizeSocketId(
    data?.astrologerId ??
      data?.astroId ??
      data?.astrologer?._id ??
      data?.astrologer?.id
  );
}

export function socketEventMatchesActiveChat(data, activeChat, profile) {
  if (!activeChat?.isActive) return false;

  const activeUserId = normalizeSocketId(activeChat.userId);
  const activeAstrologerId = normalizeSocketId(
    activeChat.astrologerId ?? profile?._id ?? profile?.id
  );
  const eventUserId = getSocketEventUserId(data);
  const eventAstrologerId = getSocketEventAstrologerId(data);

  if (!activeUserId) return false;
  if (eventUserId && eventUserId !== activeUserId) return false;
  if (eventAstrologerId && activeAstrologerId && eventAstrologerId !== activeAstrologerId) {
    return false;
  }

  return true;
}
