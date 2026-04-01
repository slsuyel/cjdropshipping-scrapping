import axios from 'axios';
import { env } from './env';

export const cjClient = axios.create({
  baseURL: 'https://developers.cjdropshipping.com/api2.0/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export const getAccessToken = async (): Promise<string> => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await cjClient.post('/authentication/getAccessToken', {
      apiKey: env.CJ_API_KEY,
    });

    const token = response.data?.data?.accessToken;
    if (!token) throw new Error('Token Error');

    cachedToken = token;
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    return token;
  } catch (error) {
    console.error('❌ CJ Auth Error:', error);
    throw new Error('CJ Auth Failed');
  }
};
