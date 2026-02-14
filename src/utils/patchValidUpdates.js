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

/**
 * Checks if the keys in the provided data object are within the allowed updates list.
 * @param {Object} data - The incoming update data.
 * @returns {boolean} - True if all keys are allowed, false otherwise.
 */
const checkAllowedUpdates = (data) => {
  const allowedUpdatesLower = ALLOWED_UPDATES.map((key) => key.toLowerCase());
  const incomingKeys = Object.keys(data).map((key) => key.toLowerCase());

  return incomingKeys.every((key) => allowedUpdatesLower.includes(key));
};

export { checkAllowedUpdates };
