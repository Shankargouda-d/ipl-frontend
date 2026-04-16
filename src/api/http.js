import axios from "axios";

const http = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://iplbackend-donh.onrender.com/api"
      : "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

export default http;