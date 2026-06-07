import 'dotenv/config';

export const tokenConfig = {
  access: {
    secret: process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret_123',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  },
  refresh: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_123',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  },
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
    signed: true
  }
};