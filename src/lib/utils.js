export const getInitials = (value, fallback) => {
  const name = value || fallback;
  if (!name) return '?';
  return name.substring(0, 2).toUpperCase();
};

export const getRatingColor = (rating) => {
  if (rating >= 7) return 'success';
  if (rating >= 5) return 'warning';
  return 'danger';
};
