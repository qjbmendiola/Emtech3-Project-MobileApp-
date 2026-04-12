import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

const { width } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────
type Option = {
  label: string;
  next: string;
};

type RouterNode = {
  id: string;
  type: "question" | "result";
  title: string;
  text: string;
  options?: Option[];
  commands?: string[];
  notes?: string[];
};

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = "https://outage-api-h3ko.onrender.com/api/router"; // ✅ Render URL

// ─── Offline fallback ─────────────────────────────────────────────────────────
const OFFLINE_START: RouterNode = {
  id: "start",
  type: "question",
  title: "Cisco Router Assistant",
  text: "Choose what you want to do.",
  options: [
    { label: "Cisco Router Configuration Guide", next: "config_menu" },
    { label: "Troubleshooting Guide",            next: "troubleshoot_menu" },
  ],
};

// ─── Icon map ─────────────────────────────────────────────────────────────────
const getOptionIcon = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("config") || l.includes("setup") || l.includes("initial")) return "⚙️";
  if (l.includes("ssh") || l.includes("remote"))   return "🔐";
  if (l.includes("lan"))                            return "🖥️";
  if (l.includes("wan") || l.includes("isp"))       return "🌐";
  if (l.includes("route") || l.includes("gateway")) return "🗺️";
  if (l.includes("save"))                           return "💾";
  if (l.includes("troubleshoot"))                   return "🔧";
  if (l.includes("no internet") || l.includes("connection")) return "📡";
  if (l.includes("slow"))                           return "🐢";
  if (l.includes("password") || l.includes("wifi")) return "🔑";
  if (l.includes("restart") || l.includes("reset")) return "🔄";
  if (l.includes("yes"))                            return "✅";
  if (l.includes("no"))                             return "❌";
  if (l.includes("simple"))                         return "⚡";
  if (l.includes("factory"))                        return "⚠️";
  if (l.includes("open") || l.includes("placement")) return "📶";
  return "▶️";
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RouterGuide() {
  const [currentNode, setCurrentNode] = useState<RouterNode | null>(null);
  const [history,     setHistory]     = useState<RouterNode[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [stepping,    setStepping]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [isOffline,   setIsOffline]   = useState(false);

  useEffect(() => { fetchStart(); }, []);

  const fetchStart = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s for Render cold start

      const res = await fetch(API_BASE, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data: RouterNode = await res.json();
      setCurrentNode(data);
      setHistory([data]);
    } catch (err: any) {
      if (
        err.name === "AbortError" ||
        err.message?.includes("Network request failed") ||
        err.message?.includes("Failed to fetch")
      ) {
        setIsOffline(true);
        setCurrentNode(OFFLINE_START);
        setHistory([OFFLINE_START]);
      } else {
        setError(err.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (nextId: string) => {
    if (isOffline) {
      setError("Cannot connect to server. Please check your internet connection and try again.");
      return;
    }
    try {
      setStepping(true);
      setError(null);

      const res = await fetch(`${API_BASE}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextId }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data: RouterNode = await res.json();
      setCurrentNode(data);
      setHistory((prev: RouterNode[]) => [...prev, data]);
    } catch (err: any) {
      setError("Could not load the next step. Check your connection.");
    } finally {
      setStepping(false);
    }
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    setError(null);
    const updated = history.slice(0, -1);
    setHistory(updated);
    setCurrentNode(updated[updated.length - 1]);
  };

  const handleRestart = () => { setError(null); fetchStart(); };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }} edges={["top", "bottom"]}>
        <View style={[styles.container, styles.centered]}>
          <View style={styles.loadingIconWrap}>
            <Text style={styles.loadingIcon}>📡</Text>
          </View>
          <ActivityIndicator size="large" color={RED} style={{ marginTop: 16 }} />
          <Text style={styles.loadingText}>Connecting to server...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f0f0" }} edges={["top", "bottom"]}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAccent} />
            <View>
              <Text style={styles.headerEyebrow}>PLDT SMART SUPPORT</Text>
              <Text style={styles.headerTitle}>Router Guide</Text>
            </View>
          </View>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerIcon}>📡</Text>
          </View>
        </View>

        {/* ── Offline banner ── */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              ⚠️  Server unreachable — offline mode
            </Text>
            <Pressable onPress={handleRestart} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* ── Error banner ── */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText} numberOfLines={2}>⚠️  {error}</Text>
            <Pressable onPress={() => setError(null)}>
              <Text style={styles.errorDismiss}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* ── Breadcrumb ── */}
        {history.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.breadcrumbScroll}
            contentContainerStyle={styles.breadcrumbRow}
          >
            {history.map((step: RouterNode, i: number) => (
              <View key={i} style={styles.breadcrumbItem}>
                <View style={[
                  styles.breadcrumbDot,
                  i === history.length - 1 && styles.breadcrumbDotActive,
                ]} />
                <Text
                  style={[
                    styles.breadcrumbLabel,
                    i === history.length - 1 && styles.breadcrumbLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
                {i < history.length - 1 && (
                  <Text style={styles.breadcrumbArrow}> › </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* ── Body ── */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {currentNode && (
            <>
              <Text style={styles.stepCounter}>
                STEP {history.length} OF YOUR GUIDE
              </Text>

              <View style={styles.card}>
                <View style={styles.cardStripe} />
                <View style={styles.cardInner}>
                  <View style={[
                    styles.badge,
                    currentNode.type === "result" ? styles.badgeResult : styles.badgeQuestion,
                  ]}>
                    <Text style={styles.badgeText}>
                      {currentNode.type === "result" ? "✓  Result" : "?  Question"}
                    </Text>
                  </View>

                  <Text style={styles.cardTitle}>{currentNode.title}</Text>
                  <Text style={styles.cardText}>{currentNode.text}</Text>

                  {currentNode.commands && currentNode.commands.length > 0 && (
                    <View style={styles.commandBlock}>
                      <View style={styles.commandHeaderRow}>
                        <View style={styles.commandDot} />
                        <Text style={styles.commandHeaderText}>CLI COMMANDS</Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Text style={styles.commandCode}>
                          {currentNode.commands.join("\n")}
                        </Text>
                      </ScrollView>
                    </View>
                  )}

                  {currentNode.notes && currentNode.notes.length > 0 && (
                    <View style={styles.notesBlock}>
                      <Text style={styles.notesHeader}>💡  NOTES</Text>
                      {currentNode.notes.map((note: string, i: number) => (
                        <View key={i} style={styles.noteRow}>
                          <View style={styles.noteLine} />
                          <Text style={styles.noteText}>{note}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {currentNode.type === "question" && currentNode.options && (
                    <View style={styles.optionsBlock}>
                      <Text style={styles.optionsLabel}>SELECT AN OPTION</Text>
                      {currentNode.options.map((option: Option, i: number) => (
                        <Pressable
                          key={i}
                          style={({ pressed }: { pressed: boolean }) => [
                            styles.optionRow,
                            pressed && styles.optionRowPressed,
                            stepping && styles.optionRowDisabled,
                          ]}
                          onPress={() => handleOptionClick(option.next)}
                          disabled={stepping}
                        >
                          <View style={styles.optionIconWrap}>
                            <Text style={styles.optionIcon}>
                              {stepping ? "⏳" : getOptionIcon(option.label)}
                            </Text>
                          </View>
                          <Text style={styles.optionLabel} numberOfLines={2}>
                            {option.label}
                          </Text>
                          <Text style={styles.optionChevron}>›</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <View style={styles.navRow}>
                    <Pressable
                      style={({ pressed }: { pressed: boolean }) => [
                        styles.navBtn,
                        styles.navBtnBack,
                        history.length <= 1 && styles.navBtnDisabled,
                        pressed && history.length > 1 && styles.navBtnBackPressed,
                      ]}
                      onPress={handleBack}
                      disabled={history.length <= 1}
                    >
                      <Text style={styles.navBtnBackText}>← Back</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }: { pressed: boolean }) => [
                        styles.navBtn,
                        styles.navBtnRestart,
                        pressed && styles.navBtnRestartPressed,
                      ]}
                      onPress={handleRestart}
                    >
                      <Text style={styles.navBtnRestartText}>↺ Restart</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {history.length > 1 && (
                <View style={styles.historyCard}>
                  <View style={styles.historyHeaderRow}>
                    <View style={styles.historyHeaderAccent} />
                    <Text style={styles.historyTitle}>GUIDE PROGRESS</Text>
                  </View>
                  {history.map((step: RouterNode, i: number) => (
                    <View key={i} style={styles.historyItem}>
                      <View style={styles.historyTimelineCol}>
                        <View style={[
                          styles.historyDot,
                          i === history.length - 1 && styles.historyDotActive,
                        ]} />
                        {i < history.length - 1 && <View style={styles.historyLine} />}
                      </View>
                      <View style={styles.historyBody}>
                        <Text style={[
                          styles.historyStepTitle,
                          i === history.length - 1 && styles.historyStepTitleActive,
                        ]}>
                          {step.title}
                        </Text>
                        <Text style={styles.historyStepText} numberOfLines={1}>
                          {step.text}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const RED       = "#E53935";
const RED_DARK  = "#B71C1C";
const RED_LIGHT = "#FFEBEE";
const RED_MED   = "#FFCDD2";
const BG        = "#F0F0F0";
const SURFACE   = "#FFFFFF";
const SURFACE2  = "#FAFAFA";
const BORDER    = "#E0E0E0";
const TEXT1     = "#1A1A1A";
const TEXT2     = "#555555";
const TEXT3     = "#999999";

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG, paddingHorizontal: 16, paddingTop: 8 },
  centered:     { justifyContent: "center", alignItems: "center" },
  loadingIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: RED_LIGHT, alignItems: "center", justifyContent: "center" },
  loadingIcon:  { fontSize: 32 },
  loadingText:  { marginTop: 12, color: TEXT2, fontSize: 14, letterSpacing: 0.4 },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: RED },
  headerLeft:   { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAccent: { width: 4, height: 38, backgroundColor: RED, borderRadius: 2 },
  headerEyebrow:{ fontSize: 10, fontWeight: "700", color: RED, letterSpacing: 2, marginBottom: 2 },
  headerTitle:  { fontSize: 22, fontWeight: "800", color: TEXT1, letterSpacing: 0.2 },
  headerIconWrap:{ width: 44, height: 44, borderRadius: 22, backgroundColor: RED_LIGHT, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: RED_MED },
  headerIcon:   { fontSize: 20 },
  offlineBanner:{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff3e0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: "#f97316", gap: 8 },
  offlineBannerText: { flex: 1, color: "#92400e", fontSize: 12, lineHeight: 17 },
  retryBtn:     { backgroundColor: RED, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  errorBanner:  { flexDirection: "row", alignItems: "center", backgroundColor: RED_LIGHT, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: RED, gap: 8 },
  errorBannerText: { flex: 1, color: RED_DARK, fontSize: 12, lineHeight: 17 },
  errorDismiss: { color: RED, fontWeight: "700", fontSize: 16, padding: 4 },
  breadcrumbScroll: { marginBottom: 10, flexGrow: 0 },
  breadcrumbRow:{ flexDirection: "row", alignItems: "center" },
  breadcrumbItem:{ flexDirection: "row", alignItems: "center" },
  breadcrumbDot:{ width: 5, height: 5, borderRadius: 3, backgroundColor: BORDER, marginRight: 4 },
  breadcrumbDotActive: { backgroundColor: RED },
  breadcrumbLabel: { fontSize: 11, color: TEXT3, maxWidth: 90 },
  breadcrumbLabelActive: { color: TEXT1, fontWeight: "600" },
  breadcrumbArrow: { color: TEXT3, fontSize: 13 },
  stepCounter:  { fontSize: 10, fontWeight: "700", color: RED, letterSpacing: 2, marginBottom: 10 },
  card:         { backgroundColor: SURFACE, borderRadius: 16, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardStripe:   { height: 5, backgroundColor: RED },
  cardInner:    { padding: 18 },
  badge:        { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 12 },
  badgeQuestion:{ backgroundColor: "#E3F2FD" },
  badgeResult:  { backgroundColor: "#E8F5E9" },
  badgeText:    { fontSize: 10, fontWeight: "700", color: TEXT1, letterSpacing: 0.8, textTransform: "uppercase" },
  cardTitle:    { fontSize: 18, fontWeight: "800", color: TEXT1, marginBottom: 8, lineHeight: 25 },
  cardText:     { fontSize: 14, color: TEXT2, marginBottom: 16, lineHeight: 22 },
  commandBlock: { backgroundColor: "#1e2a3a", borderRadius: 10, padding: 14, marginBottom: 16 },
  commandHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  commandDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: RED },
  commandHeaderText: { fontSize: 10, fontWeight: "700", color: "#90caf9", letterSpacing: 1.5 },
  commandCode:  { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 12, color: "#b3d9ff", lineHeight: 22 },
  notesBlock:   { backgroundColor: "#fffde7", borderRadius: 10, padding: 14, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: "#f59e0b" },
  notesHeader:  { fontSize: 10, fontWeight: "700", color: "#b45309", letterSpacing: 1.5, marginBottom: 10 },
  noteRow:      { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  noteLine:     { width: 2, minHeight: 16, backgroundColor: "#f59e0b", borderRadius: 1, marginTop: 3 },
  noteText:     { flex: 1, fontSize: 13, color: "#78550a", lineHeight: 20 },
  optionsBlock: { marginBottom: 16 },
  optionsLabel: { fontSize: 10, fontWeight: "700", color: TEXT3, letterSpacing: 2, marginBottom: 10 },
  optionRow:    { flexDirection: "row", alignItems: "center", backgroundColor: SURFACE2, borderRadius: 12, padding: 13, marginBottom: 8, borderWidth: 1.5, borderColor: BORDER, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  optionRowPressed: { backgroundColor: RED_LIGHT, borderColor: RED },
  optionRowDisabled: { opacity: 0.45 },
  optionIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: RED_LIGHT, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: RED_MED },
  optionIcon:   { fontSize: 18 },
  optionLabel:  { flex: 1, fontSize: 14, fontWeight: "600", color: TEXT1, lineHeight: 20 },
  optionChevron:{ fontSize: 22, color: RED, fontWeight: "700" },
  navRow:       { flexDirection: "row", gap: 10, marginTop: 4 },
  navBtn:       { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  navBtnBack:   { backgroundColor: "transparent", borderWidth: 1.5, borderColor: BORDER },
  navBtnBackPressed: { backgroundColor: "#f5f5f5" },
  navBtnDisabled: { opacity: 0.3 },
  navBtnBackText: { color: TEXT2, fontWeight: "700", fontSize: 14 },
  navBtnRestart:{ backgroundColor: RED, shadowColor: RED, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 },
  navBtnRestartPressed: { backgroundColor: RED_DARK },
  navBtnRestartText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  historyCard:  { backgroundColor: SURFACE, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  historyHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  historyHeaderAccent: { width: 3, height: 14, backgroundColor: RED, borderRadius: 2 },
  historyTitle: { fontSize: 10, fontWeight: "700", color: TEXT3, letterSpacing: 2 },
  historyItem:  { flexDirection: "row", gap: 10, marginBottom: 4 },
  historyTimelineCol: { alignItems: "center", width: 14 },
  historyDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: BORDER, marginTop: 3 },
  historyDotActive: { backgroundColor: RED },
  historyLine:  { flex: 1, width: 2, backgroundColor: BORDER, marginTop: 3, marginBottom: -4, minHeight: 22 },
  historyBody:  { flex: 1, paddingBottom: 16 },
  historyStepTitle: { fontSize: 13, fontWeight: "600", color: TEXT3, marginBottom: 2 },
  historyStepTitleActive: { color: TEXT1 },
  historyStepText: { fontSize: 11, color: "#bbb", lineHeight: 16 },
});
