export const getRevertReason = (message) => {
  const [_, reason, __] = message.split('"');
  return reason;
};
