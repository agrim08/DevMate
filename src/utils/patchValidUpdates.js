const ALLOWED_UPDATES = [
  "userId",
  "photoUrl",
  "Bio",
  "gender",
  "age",
  "skills",
];

const checkAllowedUpdates = (data) => {
  const allowedUpdates = Object.keys(data).every((k) =>
    ALLOWED_UPDATES.includes(k)
  );
  return allowedUpdates;
};

module.exports = { checkAllowedUpdates };
