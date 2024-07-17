import axios from 'axios';
import Cookies from "js-cookie";
import https from 'https';

const baseURLs = {
  development: 'https://localhost:7113/api',
  test: 'https://localhost:7113/api',
  production: 'https://adminapi.grupotepsi.com/api',
};

const currentEnv = 'production';
export const baseURL = baseURLs[currentEnv];

const moduloActual = "-";
const nombreCarpetaAzure = ""; // para los archivos subidos en azure

export const authApi = (token?: string, ignoreToken = false) => {
  const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 20000,
    headers: {
      'Modulo': moduloActual,
      'CarpetaAzure': nombreCarpetaAzure,
    }
  });

  // if (currentEnv === 'development') {
    // axiosInstance.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  // }

  if(!ignoreToken){
    axiosInstance.interceptors.request.use(async (config) => {
      const token1 = token ? token : await waitForToken();
      config.headers.Authorization = `Bearer ${token1}`;
      return config;
      }, (error) => {
        return Promise.reject(error);
      });
  }

  return axiosInstance;
};

const waitForToken = async (maxRetries = 5, interval = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    const token = Cookies.get("token");
    if (token) {
      return token;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
    retries++;
  }
  console.log("Token not found in cookies after waiting");
};