import axiosInstance from './axiosInstance';

export async function login(username, password) {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password,
  });
  return response.data;
}
