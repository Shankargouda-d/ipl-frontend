import http from "./http";

export const getTeams = async () => {
  const { data } = await http.get("/teams");
  return data;
};