import * as dotenv from 'dotenv';
dotenv.config();

// export const MAIL_HOST = process.env.MAIL_HOST || '';
// export const MAIL_PORT = process.env.MAIL_PORT || '';
// export const MAIL_USER = process.env.MAIL_USER || '';
// export const MAIL_PASS = process.env.MAIL_PASS || '';

export const SEND_GRID_KEY = process.env.SEND_GRID_KEY || '';
export const FROM_EMAIL = process.env.FROM_EMAIL_ADDRESS || '';
