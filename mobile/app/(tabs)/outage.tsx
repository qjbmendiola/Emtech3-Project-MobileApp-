import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import OutageMap from "../../components/OutageMap";

// ─── Design tokens (matches chat.tsx + router.tsx) ────────────────────────────
const RED       = "#E53935";
const RED_DARK  = "#B71C1C";
const RED_LIGHT = "#FFEBEE";
const RED_MED   = "#FFCDD2";
const BG        = "#F0F0F0";
const SURFACE   = "#FFFFFF";
const BORDER    = "#E0E0E0";
const TEXT1     = "#1A1A1A";
const TEXT2     = "#555555";
const TEXT3     = "#999999";

type Outage = {
  id: number;
  title: string;
  severity: string;
  users: number;
  lat: number;
  lng: number;
};

const outages: Outage[] = [
  { id: 1, title: "Quezon City", severity: "High",   users: 240, lat: 14.6760, lng: 121.0437 },
  { id: 2, title: "Manila",      severity: "Medium", users: 120, lat: 14.5995, lng: 120.9842 },
  { id: 3, title: "Cebu",        severity: "Low",    users: 60,  lat: 10.3157, lng: 123.8854 },
];

function severityColor(severity: string): string {
  if (severity === "High")   return RED;
  if (severity === "Medium") return "#f97316";
  return "#16a34a";
}

function severityEmoji(severity: string): string {
  if (severity === "High")   return "🔴";
  if (severity === "Medium") return "🟡";
  return "🟢";
}

export default function OutageScreen() {
  const [selected, setSelected] = useState<Outage | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAccent} />
          <View>
            <Text style={styles.headerEyebrow}>PLDT SMART SUPPORT</Text>
            <Text style={styles.headerTitle}>Outage Map</Text>
          </View>
        </View>
        <View style={styles.headerIconWrap}>
          <Text style={styles.headerIcon}>🗺️</Text>
        </View>
      </View>

      {/* ── Legend row ── */}
      <View style={styles.legendRow}>
        {[
          { label: "High",   color: RED,       emoji: "🔴" },
          { label: "Medium", color: "#f97316", emoji: "🟡" },
          { label: "Low",    color: "#16a34a", emoji: "🟢" },
        ].map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <Text style={styles.legendEmoji}>{item.emoji}</Text>
            <Text style={[styles.legendLabel, { color: item.color }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Map ── */}
      <View style={{ flex: 1 }}>
        <OutageMap outages={outages} onSelect={(item) => setSelected(outages.find(o => o.id === item.id) || null)} />

        {/* ── Selected outage panel ── */}
        {selected && (
          <View style={styles.panel}>
            {/* Red top stripe */}
            <View style={styles.panelStripe} />

            <View style={styles.panelInner}>
              {/* Badge */}
              <View style={[
                styles.badge,
                { backgroundColor: severityColor(selected.severity) + "20" }
              ]}>
                <Text style={styles.badgeText}>
                  {severityEmoji(selected.severity)}  {selected.severity.toUpperCase()} SEVERITY
                </Text>
              </View>

              <Text style={styles.panelTitle}>{selected.title}</Text>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selected.users}</Text>
                  <Text style={styles.statLabel}>Affected Users</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: severityColor(selected.severity) }]}>
                    {selected.severity}
                  </Text>
                  <Text style={styles.statLabel}>Severity Level</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>Live</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>

              {/* Close button */}
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && styles.closeBtnPressed,
                ]}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: RED,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAccent: { width: 4, height: 36, backgroundColor: RED, borderRadius: 2 },
  headerEyebrow: { fontSize: 10, fontWeight: "700", color: RED, letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: TEXT1, letterSpacing: 0.2 },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RED_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: RED_MED,
  },
  headerIcon: { fontSize: 18 },

  // Legend
  legendRow: {
    flexDirection: "row",
    backgroundColor: SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendEmoji: { fontSize: 12 },
  legendLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  // Outage info panel
  panel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: SURFACE,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  panelStripe: { height: 4, backgroundColor: RED },
  panelInner: { padding: 16 },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT1,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT1,
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: TEXT1, marginBottom: 2 },
  statLabel: { fontSize: 10, color: TEXT3, fontWeight: "600", letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: BORDER },

  closeBtn: {
    backgroundColor: RED,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  closeBtnPressed: { backgroundColor: RED_DARK },
  closeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
