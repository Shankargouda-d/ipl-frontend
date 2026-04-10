import http from "./http";

export const addPlayer = async (payload) => {
  const { data } = await http.post("/players", payload);
  return data;
};

export const getPlayersByTeam = async (teamId) => {
  const { data } = await http.get(`/players/team/${teamId}`);
  return data;
};

export const updatePlayer = async (playerId, payload) => {
  const { data } = await http.put(`/players/${playerId}`, payload);
  return data;
};

export const deletePlayer = async (playerId) => {
  const { data } = await http.delete(`/players/${playerId}`);
  return data;
};