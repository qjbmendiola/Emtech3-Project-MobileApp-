import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const RED       = "#E53935";
const RED_LIGHT = "#FFEBEE";
const RED_MED   = "#FFCDD2";
const BG        = "#F0F0F0";
const SURFACE   = "#FFFFFF";
const BORDER    = "#E0E0E0";
const TEXT1     = "#1A1A1A";
const TEXT2     = "#555555";
const TEXT3     = "#999999";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // ✅ DISPLAY NAME & INITIALS LOGIC
  const displayName =
    typeof user === "string"
      ? user
      : `${user?.firstName || ""} ${user?.surname || ""}`.trim() ||
        user?.username ||
        "User";

  const getInitials = () => {
    if (typeof user === "string") return user.substring(0, 2).toUpperCase();
    const f = user?.firstName?.charAt(0) || "";
    const s = user?.surname?.charAt(0) || "";
    return (f + s).toUpperCase() || "??";
  };

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [showChat,    setShowChat]    = useState(false);
  const [showOutage,  setShowOutage]  = useState(false);
  const [showRouter,  setShowRouter]  = useState(false);
  const [info,        setInfo]        = useState<string | null>(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace("/login");
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      
      {/* ✅ CLICK-OUTSIDE BACKDROP (Fixes layering & closing) */}
      {menuOpen && (
        <Pressable 
          style={styles.backdrop} 
          onPress={() => setMenuOpen(false)} 
        />
      )}

      {/* ── Header ── */}
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAccent} />
            <View>
              <Text style={styles.headerEyebrow}>PLDT SMART SUPPORT</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
          </View>

          <View style={styles.profileContainer}>
            <Pressable
              style={[styles.avatarBtn, menuOpen && { borderColor: RED }]}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </Pressable>

            {menuOpen && (
              <View style={styles.dropdown}>
                <Text style={styles.dropdownUser} numberOfLines={1}>{displayName}</Text>
                <View style={styles.dropdownDivider} />
                <Pressable onPress={handleLogout} style={styles.dropdownRow}>
                  <Ionicons name="log-out-outline" size={16} color={RED} />
                  <Text style={styles.dropdownItem}>Logout</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* ── Greeting Card ── */}
        <View style={styles.greetingCard}>
          <Text style={styles.greetingLabel}>{greeting},</Text>
          <Text style={styles.greetingName}>{displayName} 👋</Text>
          <Text style={styles.greetingSubtext}>How can we help you today?</Text>
        </View>

        {/* ── Status Card ── */}
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Stable Connection</Text>
        </View>

        <Text style={styles.sectionLabel}>SERVICES</Text>

        {/* AI Network Assistant */}
        <View style={styles.card}>
          <Pressable style={styles.cardHeader} onPress={() => setShowChat(!showChat)}>
            <View style={styles.cardIconWrap}><Ionicons name="chatbubble-ellipses" size={18} color={RED} /></View>
            <Text style={styles.cardTitle}>AI Network Assistant</Text>
            <Ionicons name={showChat ? "chevron-up" : "chevron-down"} size={16} color={TEXT3} style={{ marginLeft: "auto" }} />
          </Pressable>
          {showChat && (
            <View style={styles.cardBody}>
              <View style={styles.cardStripe} />
              <Text style={styles.cardBodyLabel}>RECENT TOPICS</Text>
              {["Slow internet", "LOS blinking", "No connection"].map((item, i) => (
                <View key={i} style={styles.listRow}><View style={styles.listDot} /><Text style={styles.listText}>{item}</Text></View>
              ))}
              <Pressable style={styles.cardLink} onPress={() => router.push("/(tabs)/chat")}>
                <Text style={styles.cardLinkText}>Open Chat</Text>
                <Ionicons name="arrow-forward" size={13} color={RED} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Live Outage Map */}
        <View style={styles.card}>
          <Pressable style={styles.cardHeader} onPress={() => setShowOutage(!showOutage)}>
            <View style={styles.cardIconWrap}><Ionicons name="map" size={18} color={RED} /></View>
            <Text style={styles.cardTitle}>Live Outage Map</Text>
            <Ionicons name={showOutage ? "chevron-up" : "chevron-down"} size={16} color={TEXT3} style={{ marginLeft: "auto" }} />
          </Pressable>
          {showOutage && (
            <View style={styles.cardBody}>
              <View style={styles.cardStripe} />
              <Text style={styles.cardBodyLabel}>CURRENT STATUS</Text>
              {[{ a: "Quezon City", s: "Outage", c: RED }, { a: "Manila", s: "Stable", c: "#16a34a" }].map((item, i) => (
                <View key={i} style={styles.listRow}><Text style={{fontSize: 12}}>{item.a}:</Text><Text style={{fontSize: 12, fontWeight: '700', color: item.c}}>{item.s}</Text></View>
              ))}
              <Pressable style={styles.cardLink} onPress={() => router.push("/(tabs)/outage")}>
                <Text style={styles.cardLinkText}>Open Outage Map</Text>
                <Ionicons name="arrow-forward" size={13} color={RED} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Router Troubleshooter */}
        <View style={styles.card}>
          <Pressable style={styles.cardHeader} onPress={() => setShowRouter(!showRouter)}>
            <View style={styles.cardIconWrap}><Ionicons name="settings" size={18} color={RED} /></View>
            <Text style={styles.cardTitle}>Router Troubleshooter</Text>
            <Ionicons name={showRouter ? "chevron-up" : "chevron-down"} size={16} color={TEXT3} style={{ marginLeft: "auto" }} />
          </Pressable>
          {showRouter && (
            <View style={styles.cardBody}>
              <View style={styles.cardStripe} />
              <Text style={styles.cardBodyLabel}>FIX COMMON ISSUES</Text>
              {["No internet", "Slow speed", "LOS red light"].map((item, i) => (
                <View key={i} style={styles.listRow}><View style={styles.listDot} /><Text style={styles.listText}>{item}</Text></View>
              ))}
              <Pressable style={styles.cardLink} onPress={() => router.push("/(tabs)/router")}>
                <Text style={styles.cardLinkText}>Open Router Guide</Text>
                <Ionicons name="arrow-forward" size={13} color={RED} />
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

        {/* ✅ RESTORED ORIGINAL QUICK ACTIONS */}
        <View style={styles.quickRow}>
          {[
            {
              icon: "wifi" as const,
              label: "Speed",
              info: "Check your internet speed performance.\n\nThis will help you see if your connection is slow, unstable, or working normally.",
            },
            {
              icon: "alert-circle" as const,
              label: "Report",
              info: "Report an internet outage in your area.\n\nYour report helps other users see real-time issues and improves outage tracking.",
            },
            {
              icon: "help-circle" as const,
              label: "Help",
              info: "Get help with your internet connection.\n\nUse the AI Network Assistant to troubleshoot issues instantly.",
            },
          ].map((btn, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.quickBtn,
                pressed && styles.quickBtnPressed,
              ]}
              onPress={() => setInfo(info === btn.info ? null : btn.info)}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name={btn.icon} size={22} color={RED} />
              </View>
              <Text style={styles.quickLabel}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Info Box ── */}
        {info && (
          <View style={styles.infoBox}>
            <View style={styles.infoStripe} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoText}>{info}</Text>
              <Pressable onPress={() => setInfo(null)} style={styles.infoDismiss}>
                <Text style={styles.infoDismissText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingHorizontal: 16 },
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 999 },

  // Header
  headerWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, zIndex: 1000 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: SURFACE, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
    borderBottomWidth: 2, borderBottomColor: RED, elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAccent: { width: 4, height: 36, backgroundColor: RED, borderRadius: 2 },
  headerEyebrow: { fontSize: 10, fontWeight: "700", color: RED, letterSpacing: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: TEXT1 },

  // Profile & Initials
  profileContainer: { position: "relative" },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: RED_LIGHT,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: RED_MED,
  },
  avatarText: { color: RED, fontWeight: "800", fontSize: 14 },
  dropdown: {
    position: "absolute", top: 50, right: 0, backgroundColor: SURFACE,
    borderRadius: 12, width: 180, padding: 15, zIndex: 2000, elevation: 10,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, borderWidth: 1, borderColor: BORDER,
  },
  dropdownUser: { fontWeight: "700", color: TEXT1, fontSize: 14, marginBottom: 8 },
  dropdownDivider: { height: 1, backgroundColor: BORDER, marginBottom: 10 },
  dropdownRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dropdownItem: { color: RED, fontWeight: "700", fontSize: 14 },

  // Greeting
  greetingCard: { backgroundColor: RED, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 4 },
  greetingLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  greetingName: { fontSize: 22, fontWeight: "800", color: "#FFF", marginVertical: 2 },
  greetingSubtext: { color: "rgba(255,255,255,0.9)", fontSize: 13 },

  // Status
  statusCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: "#bbf7d0", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16a34a" },
  statusText: { color: "#15803d", fontWeight: "700", fontSize: 12 },

  sectionLabel: { fontSize: 10, fontWeight: "700", color: TEXT3, letterSpacing: 1.5, marginBottom: 10 },

  // Cards
  card: { backgroundColor: SURFACE, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  cardIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: RED_LIGHT, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: RED_MED },
  cardTitle: { fontSize: 14, fontWeight: "700", color: TEXT1 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  cardStripe: { height: 2, backgroundColor: RED, borderRadius: 2, marginBottom: 10 },
  cardBodyLabel: { fontSize: 10, fontWeight: "700", color: TEXT3, letterSpacing: 1, marginBottom: 6 },
  listRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  listDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: RED },
  listText: { fontSize: 12, color: TEXT2 },
  cardLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  cardLinkText: { color: RED, fontWeight: "700", fontSize: 12 },

  // Quick Actions
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  quickBtn: { flex: 1, backgroundColor: SURFACE, borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 4, borderWidth: 1, borderColor: BORDER },
  quickBtnPressed: { backgroundColor: RED_LIGHT, borderColor: RED_MED },
  quickIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: RED_LIGHT, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11, fontWeight: "600", color: TEXT1 },

  // Info Box
  infoBox: { flexDirection: "row", backgroundColor: SURFACE, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER, gap: 10, marginBottom: 10 },
  infoStripe: { width: 3, backgroundColor: RED, borderRadius: 2 },
  infoText: { fontSize: 12, color: TEXT2, lineHeight: 18, marginBottom: 6 },
  infoDismiss: { alignSelf: "flex-start" },
  infoDismissText: { color: RED, fontWeight: "700", fontSize: 12 },
});