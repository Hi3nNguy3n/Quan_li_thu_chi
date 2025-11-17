import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quan-ly-chi-tieu',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID || ''
};

export default env;
