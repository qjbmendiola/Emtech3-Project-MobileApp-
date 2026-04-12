import { Platform } from "react-native";

const BASE_URL = "https://outage-api-h3ko.onrender.com/api";

export async function getOutages() {
  try {
    const res = await fetch(`${BASE_URL}/outage/get-outages`);
    const data = await res.json();

    return data.map((item) => ({
      id: item.id || Math.random().toString(),
      title: item.area || "Unknown",
      severity:
        item.status === "Outage"
          ? "High"
          : item.status === "Investigating"
          ? "Medium"
          : "Low",
      users: item.affectedUsers || 0,
      lat: item.lat || 0,
      lng: item.lng || 0,
    }));
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}