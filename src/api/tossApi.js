import http from "./http";

export const saveToss = async (payload) => {
  const { data } = await http.post("/toss", payload);
  return data;
};

export const getTossByMatch = async (matchId) => {
  const { data } = await http.get(`/toss/${matchId}`);
  return data;
};