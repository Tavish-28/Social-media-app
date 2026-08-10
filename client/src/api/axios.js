import axios from "axios";
// import VITE_BASEURL from ""
const api = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
});
export default api;
