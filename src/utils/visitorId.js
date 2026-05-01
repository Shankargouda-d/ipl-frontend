export const getVisitorId = () => {
  let vid = localStorage.getItem("ipl_visitor_id");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem("ipl_visitor_id", vid);
  }
  return vid;
};
