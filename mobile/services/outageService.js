const BASE_URL = "https://outage-api-h3ko.onrender.com/api";

export async function getOutages() {
  try {
    const res = await fetch(`${BASE_URL}/outage`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("[outageService] HTTP error:", res.status);
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("[outageService] expected array, got:", typeof data);
      return [];
    }

    const mapped = data
      .filter((item) => item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng))
      .map((item) => ({
        id:    item.id,
        title: item.area,
        severity:
          item.status === "Outage"        ? "High"   :
          item.status === "Investigating" ? "Medium" :
                                            "Low",   // Normal → Low (green pin)
        users: item.affectedUsers,
        lat:   item.lat,
        lng:   item.lng,
      }));

    console.log("[outageService] mapped outages:", mapped.length);
    return mapped;

  } catch (err) {
    console.error("[outageService] fetch error:", err);
    return [];
  }
}