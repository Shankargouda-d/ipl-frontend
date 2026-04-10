import http from "./http";

export const saveSquad = async (payload) => {
  const { data } = await http.post("/squad", payload);
  return data;
};

export const getSquad = async (matchId, teamId) => {
  const { data } = await http.get(`/squad/${matchId}/${teamId}`);
  return data;
};