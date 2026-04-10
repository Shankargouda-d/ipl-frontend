import http from "./http";

export const getPlayerStats = async () => {
  const { data } = await http.get("/stats/players");
  return data;
};