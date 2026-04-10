import http from "./http";

export const getPointsTable = async () => {
  const { data } = await http.get("/points");
  return data;
};