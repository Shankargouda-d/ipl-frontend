export const formatTeamPlayerId = (teamId, count) => {
  return `${teamId}${String(count).padStart(2, "0")}`;
};