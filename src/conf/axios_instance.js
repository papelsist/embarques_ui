import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "http://10.10.1.85:8000/api",
    timeout: 50000,
    headers: {}
  });


/*   const axiosInstance = axios.create({
    baseURL: "http://199.198.69.63:7000/api",
    timeout: 50000,
    headers: {}
  }); */
 
  export default axiosInstance;


  export const apiUrl = {
    url: "http://10.10.1.85:8000/api/",
    url2: "http://10.10.1.85:8000/",
  }

/*   export const apiUrl = {
    url: "http://198.199.69.63:7000/api/",
    url2: "http://198.199.69.63:7000/",
  }
 */