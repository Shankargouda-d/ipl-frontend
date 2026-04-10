import http from "./http";

export const saveInnings = async (payload) => {
  const { data } = await http.post("/innings", payload);
  return data;
};

export const getInningsByMatch = async (matchId) => {
  const { data } = await http.get(`/innings/${matchId}`);
  return data;
};