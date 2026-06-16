export const formatVisitTime = (time) => {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  if (isNaN(h)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export const formatVisitDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};
