import http from "./http";

// GET all innings for a match
export const getInningsByMatch = async (matchId) => {
  const { data } = await http.get(`/innings/match/${matchId}`);
  return data;
};

// GET batting
export const getBatting = async (inningsId) => {
  const { data } = await http.get(`/innings/${inningsId}/batting`);
  return data;
};

// GET bowling
export const getBowling = async (inningsId) => {
  const { data } = await http.get(`/innings/${inningsId}/bowling`);
  return data;
};