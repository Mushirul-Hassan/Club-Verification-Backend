export const parseFlexibleDate = (dobString) => {
  if (!dobString) return null;

  // Remove all spaces
  const clean = dobString.replace(/\s/g, '');

  // Try direct parse first (YYYY-MM-DD)
  let date = new Date(clean);
  if (!isNaN(date.getTime())) return date;

  // Try DD-MM-YYYY or DD/MM/YYYY
  const parts = clean.split(/[-\/]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) return date;
  }

  return null; // invalid
};