import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);


api.interceptors.response.use(

  (response) => response,
  

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {

            window.location.href = '/signin';
            return Promise.reject(error);
        }

        const { data } = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        });


        localStorage.setItem('accessToken', data.access);


        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;


        return api(originalRequest);

      } catch (refreshError) {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);

export default api;
