import axios from "axios";

const http = axios.create({
  baseURL: "https://iplbackend-donh.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
