/**
 * Generate a deterministic chat document ID from two participant IDs.
 * MUST match user-web getChatId logic exactly.
 * Sorts IDs alphabetically after trimming to ensure consistent ID generation
 * regardless of call order: getChatId(astroId, userId) === getChatId(userId, astroId)
 */
export function getChatId(uid1, uid2) {
  if (!uid1 || !uid2) return "";
  const s1 = uid1.toString();
  const s2 = uid2.toString();
  return s1 < s2 ? `${s1}_${s2}` : `${s2}_${s1}`;
}

// export const getChatId = (uid1, uid2) => {
//   if (!uid1 || !uid2) return "";
//   const ids = [uid1.trim(), uid2.trim()].sort();
//   return ids.join("_");
// };

/**
 * Format a Firestore timestamp into a time string (e.g. "2:30 PM").
 */
export function formatChatTime(timestamp) {
  if (!timestamp) return "";
  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Normalize a date to midnight for day comparison.
 */
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Return a human-readable date label: "Today", "Yesterday", or "DD Mon YYYY".
 */
export function getDateLabel(timestamp) {
  if (!timestamp) return "";
  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const messageDate = normalizeDate(date);
  const today = normalizeDate(new Date());
  const diffTime = today - messageDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format elapsed seconds into MM:SS display.
 */
export function formatTimer(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
