import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : "http://192.168.100.128:5000/api";

export async function getOutages() {
  try {
    const res = await fetch(`${BASE_URL}/outage`);
    const data = await res.json();

    return data.map((item) => ({
      id: item.id,
      title: item.area,
      severity:
        item.status === "Outage"
          ? "High"
          : item.status === "Investigating"
          ? "Medium"
          : "Low",
      users: item.affectedUsers,
      lat: item.lat,
      lng: item.lng,
    }));
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}