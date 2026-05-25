const calculateAge = (dobString) => {
  if (!dobString) return null;

  const [day, month, year] = dobString.split("/");
  const birthDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// helper function for club entry validation
const checkClubEligibility = (age) => {
  if (age === null)
    return { eligible: false, status: "REQUIRES_MANUAL_OVERRIDE" };
  if (age >= 18) {
    return { eligible: true, status: "ALLOWED" };
  }
  return { eligible: false, status: "DENIED" };
};

module.exports = { calculateAge, checkClubEligibility };
