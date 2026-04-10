import http from "./http";

export const createMatch = async (payload) => {
  const { data } = await http.post("/matches", payload);
  return data;
};

export const getMatches = async () => {
  const { data } = await http.get("/matches");
  return data;
};

export const getMatchById = async (matchId) => {
  const { data } = await http.get(`/matches/${matchId}`);
  return data;
};