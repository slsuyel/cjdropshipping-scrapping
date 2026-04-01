import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  JWT_SECRET: process.env.JWT_SECRET || 'secret-jwt-key',
  CJ_API_KEY: process.env.CJ_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
