import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import OutageMap from "../../components/OutageMap";
import { getOutages } from "../../services/outageService";
import { Outage } from "../../types/outage";

const RED = "#E53935";

function severityColor(severity: string) {
  if (severity === "High")   return RED;
  if (severity === "Medium") return "#f97316";
  return "#16a34a";
}

function severityBg(severity: string) {
  if (severity === "High")   return "#FFEBEE";
  if (severity === "Medium") return "#FFF3E0";
  return "#E8F5E9";
}

export default function OutageScreen() {
  const [outages,  setOutages]  = useState<Outage[]>([]);
  const [selected, setSelected] = useState<Outage | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const data = await getOutages();
      console.log("[OutageScreen] loaded outages:", data.length);
      setOutages(data);
    } catch (err) {
      console.error("[OutageScreen] load error:", err);
      setError("Could not load outage data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Outage Map</Text>
        {loading && <ActivityIndicator size="small" color={RED} />}
        {!loading && (
          <Pressable onPress={load} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>↺ Refresh</Text>
          </Pressable>
        )}
      </View>

      {/* ERROR BANNER */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Pressable onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* MAP + OVERLAYS */}
      <View style={{ flex: 1 }}>

        {/* MAP — always rendered so WebView is ready */}
        <OutageMap
          outages={outages}
          selected={selected}
          onSelect={(item) => setSelected(item)}
        />

        {/* LOADING OVERLAY — shown on top of map while data loads */}
        {loading && outages.length === 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={styles.loadingText}>Loading outages...</Text>
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && outages.length === 0 && !error && (
          <View style={styles.loadingOverlay}>
            <Text style={{ fontSize: 40 }}>✅</Text>
            <Text style={styles.loadingText}>No outages reported right now.</Text>
          </View>
        )}

        {/* SELECTED PANEL */}
        {selected && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{selected.title}</Text>
              <Pressable onPress={() => setSelected(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={[styles.severityBadge, { backgroundColor: severityBg(selected.severity) }]}>
              <Text style={[styles.severityText, { color: severityColor(selected.severity) }]}>
                {selected.severity} Severity
              </Text>
            </View>

            <Text style={styles.panelUsers}>👥 {selected.users} users affected</Text>
          </View>
        )}

        {/* FLOATING BOTTOM LIST */}
        <View style={styles.bottomList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Live Outages</Text>
            <Text style={styles.listCount}>{outages.length} active</Text>
          </View>

          {outages.length === 0 && !loading ? (
            <Text style={styles.noOutagesText}>No outages detected</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {outages.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.card,
                    selected?.id === item.id && styles.cardSelected,
                  ]}
                  onPress={() => setSelected(item)}
                >
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.cardBadge, { backgroundColor: severityBg(item.severity) }]}>
                    <Text style={[styles.cardSeverity, { color: severityColor(item.severity) }]}>
                      {item.severity}
                    </Text>
                  </View>
                  <Text style={styles.cardUsers}>👥 {item.users} users</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  refreshBtn: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  refreshText: {
    color: RED,
    fontWeight: "700",
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  errorText:  { color: "#B71C1C", fontSize: 13, flex: 1 },
  retryText:  { color: RED, fontWeight: "700", marginLeft: 10 },
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    bottom: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    gap: 12,
  },
  loadingText: {
    color: "#555",
    fontSize: 14,
    marginTop: 8,
  },
  panel: {
    position: "absolute",
    bottom: 168,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  panelTitle:   { fontSize: 17, fontWeight: "800", color: "#1A1A1A", flex: 1 },
  closeBtn:     { padding: 4 },
  closeBtnText: { fontSize: 16, color: "#999", fontWeight: "700" },
  severityBadge:{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  severityText: { fontWeight: "700", fontSize: 13 },
  panelUsers:   { fontSize: 13, color: "#555" },
  bottomList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: "#ddd",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  listTitle:     { fontWeight: "800", fontSize: 15, color: "#1A1A1A" },
  listCount:     { fontSize: 12, color: "#999" },
  noOutagesText: { paddingHorizontal: 14, color: "#999", fontSize: 13 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 12,
    width: 140,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: RED,
    backgroundColor: "#FFEBEE",
  },
  cardTitle:    { fontWeight: "800", fontSize: 13, color: "#1A1A1A", marginBottom: 6 },
  cardBadge:    { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
  cardSeverity: { fontSize: 11, fontWeight: "700" },
  cardUsers:    { fontSize: 11, color: "#999" },
});
