import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://10.10.1.85:8000/api',
    timeout: 50000,
    headers: {}
  });

  export default axiosInstance;


  export const apiUrl = {
    url: "http://10.10.1.85:8000/api/",
    url2: "http://localhost:8000/",
  }
