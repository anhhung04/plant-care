import { API_GREENHOUSE_URL } from "@/config";

interface ApiCallParams {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
}

export const apiCall = async ({
  endpoint,
  method = "GET",
  body,
}: ApiCallParams) => {
  const url = `${API_GREENHOUSE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    console.log("📡 API Request:");
    console.log("➡️ URL:", url);
    console.log("➡️ Method:", method);
    if (body) console.log("➡️ Body:", body);

    const response = await fetch(url, config);

    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ API call failed:");
      console.error("Status:", response.status);
      console.error("Status Text:", response.statusText);
      console.error("Response Body:", responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (jsonErr) {
      console.warn("⚠️ Response is not valid JSON:", responseText);
      return responseText; // fallback if not JSON
    }
  } catch (error) {
    console.error("🔥 Fetch Exception:", error);
    throw error;
  }
};
