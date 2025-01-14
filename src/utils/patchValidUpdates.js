const ALLOWED_UPDATES = [
  "userId",
  "photoUrl",
  "bio",
  "gender",
  "userAge",
  "skills",
  "firstName",
  "lastName",
];

const checkAllowedUpdates = (data) => {
  const allowedUpdatesLower = ALLOWED_UPDATES.map((key) => key.toLowerCase());
  const incomingKeys = Object.keys(data).map((key) => key.toLowerCase());

  return incomingKeys.every((key) => allowedUpdatesLower.includes(key));
};

module.exports = { checkAllowedUpdates };
