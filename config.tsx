// config.ts
import Constants from "expo-constants";

// Đọc biến môi trường từ .env thông qua Expo Constants
const extra = Constants.expoConfig?.extra || {};

export const API_BASE_URL =
  process.env.API_BASE_URL ||
  extra.API_BASE_URL ||
  "http://104.214.177.9:8080/mobileBE";
export const SOCKET_URL =
  process.env.SOCKET_URL ||
  extra.SOCKET_URL ||
  "ws://104.214.177.9:8080/mobileBE/ws";
export const API_GREENHOUSE_URL =
  process.env.API_GREENHOUSE_URL ||
  "http://104.214.177.9:8000/api/v1/greenhouses";
