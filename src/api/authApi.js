import axiosInstance from './axiosInstance';

/**
 * Authenticate against DummyJSON.
 * Returns the full response body: { id, username, email, firstName,
 * lastName, image, accessToken, refreshToken, ... }
 */
export async function login(username, password) {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password,
    // expiresInMins: 60 — optional; DummyJSON defaults work fine
  });
  return response.data;
}
