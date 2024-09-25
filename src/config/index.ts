import * as dotenv from 'dotenv';
dotenv.config();

export const PORT: string | number = process.env.PORT || 3000;
export const SEND_GRID_KEY: string = process.env.SEND_GRID_KEY || '';
export const ALBERT_ENDPOINT: string =
  process.env.ALBERT_ENDPOINT || 'http://albert.sokrates.ai:8004';
export const CLIENT_URL: string =
  process.env.CLIENT_URL || 'http://localhost:3000';
export const BOX_URI = process.env.BOX_URI || '';

export const GPT_ENDPOINT = process.env.GPT_ENDPOINT;
export const GPT_KEY =
  process.env.GPT_KEY;
