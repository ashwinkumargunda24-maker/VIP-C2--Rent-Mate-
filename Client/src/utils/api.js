export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const normalized = imagePath.replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  return `${API_URL}/${normalized}`;
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};
