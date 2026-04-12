import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = "https://outage-api-h3ko.onrender.com/api/chat"; // ✅ Render URL

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  nextAction?: string | null;
};

// ─── Session ID ───────────────────────────────────────────────────────────────
const SESSION_ID = "mobile-session-" + Date.now();

// ─── Keywords that require login ──────────────────────────────────────────────
const PROTECTED_KEYWORDS = [
  "my account", "account number", "billing", "balance", "due date",
  "my plan", "my subscription", "my service", "my profile",
  "personal info", "account status", "registered email", "registered mobile",
];

function needsLogin(message: string): boolean {
  const text = message.toLowerCase();
  return PROTECTED_KEYWORDS.some((kw) => text.includes(kw));
}

// ─── Action button labels ─────────────────────────────────────────────────────
function getActionLabel(action: string): string {
  switch (action) {
    case "outage": return "🗺️  Open Outage Map";
    case "router": return "⚙️  Open Router Setup";
    case "login":  return "🔐  Go to Login";
    case "signup": return "📝  Create Account";
    default:       return "";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Chat() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      sender: "bot",
      text: "Hello! I'm your PLDT Smart Support assistant. How can I help you today?",
      nextAction: null,
    },
  ]);
  const [input,   setInput]   = useState("");
  const [sending, setSending] = useState(false);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    // Protected keyword check
    if (needsLogin(trimmed)) {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "You can ask general support questions without logging in. For account-specific information, please sign in first.",
        nextAction: "login",
      };
      setMessages((prev) => [...prev, botMsg]);
      setSending(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s for Render cold start

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId: SESSION_ID }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "Sorry, I didn't get a response.",
        nextAction: data.nextAction || null,
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (err: any) {
      const isTimeout = err.name === "AbortError";
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: isTimeout
          ? "The server is waking up. Please wait a moment and try again."
          : "There was an error contacting the server. Please check your internet connection.",
        nextAction: null,
      };
      setMessages((prev) => [...prev, errMsg]);
      console.error("Chat error:", err);
    } finally {
      setSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // ── Action button handler ─────────────────────────────────────────────────
  const handleAction = (action: string) => {
    if (action === "outage") router.push("/(tabs)/outage");
    else if (action === "router") router.push("/(tabs)/router");
    else if (action === "login") router.push("/login");
    else if (action === "signup") router.push("/signup");
  };

  // ── Render bubble ─────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    const showAction = !isUser && item.nextAction &&
      ["outage", "router", "login", "signup"].includes(item.nextAction);

    return (
      <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperBot]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
        )}
        <View style={{ maxWidth: "78%", gap: 6 }}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
            <Text style={isUser ? styles.textUser : styles.textBot}>{item.text}</Text>
          </View>
          {showAction && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => handleAction(item.nextAction!)}
            >
              <Text style={styles.actionBtnText}>{getActionLabel(item.nextAction!)}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerAccent} />
              <View>
                <Text style={styles.headerEyebrow}>PLDT SMART SUPPORT</Text>
                <Text style={styles.headerTitle}>Virtual Assistant</Text>
              </View>
            </View>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>💬</Text>
            </View>
          </View>

          {/* ── Message list ── */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={renderItem}
          />

          {/* ── Typing indicator ── */}
          {sending && (
            <View style={styles.typingRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>P</Text>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={RED} />
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            </View>
          )}

          {/* ── Input bar ── */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#aaa"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!sending}
              multiline={false}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                pressed && styles.sendBtnPressed,
                (!input.trim() || sending) && styles.sendBtnDisabled,
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || sending}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
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
const BORDER    = "#E0E0E0";
const TEXT1     = "#1A1A1A";
const TEXT2     = "#555555";
const TEXT3     = "#999999";

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: SURFACE, borderBottomWidth: 2, borderBottomColor: RED, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3 },
  headerLeft:   { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAccent: { width: 4, height: 36, backgroundColor: RED, borderRadius: 2 },
  headerEyebrow:{ fontSize: 10, fontWeight: "700", color: RED, letterSpacing: 2, marginBottom: 2 },
  headerTitle:  { fontSize: 18, fontWeight: "800", color: TEXT1, letterSpacing: 0.2 },
  headerIconWrap:{ width: 40, height: 40, borderRadius: 20, backgroundColor: RED_LIGHT, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: RED_MED },
  headerIcon:   { fontSize: 18 },
  listContent:  { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  bubbleWrapper:{ flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  bubbleWrapperBot: { justifyContent: "flex-start" },
  bubbleWrapperUser:{ justifyContent: "flex-end" },
  avatar:       { width: 32, height: 32, borderRadius: 16, backgroundColor: RED, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  avatarText:   { color: "#fff", fontWeight: "800", fontSize: 14 },
  bubble:       { padding: 12, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  bubbleBot:    { backgroundColor: SURFACE, borderTopLeftRadius: 4, borderWidth: 1, borderColor: BORDER },
  bubbleUser:   { backgroundColor: RED, borderTopRightRadius: 4 },
  textBot:      { color: TEXT1, fontSize: 14, lineHeight: 21 },
  textUser:     { color: "#fff", fontSize: 14, lineHeight: 21 },
  actionBtn:    { backgroundColor: RED_LIGHT, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1.5, borderColor: RED_MED, alignSelf: "flex-start" },
  actionBtnPressed: { backgroundColor: RED_MED, borderColor: RED },
  actionBtnText:{ color: RED_DARK, fontWeight: "700", fontSize: 13 },
  typingRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 6, gap: 8 },
  typingBubble: { flexDirection: "row", alignItems: "center", backgroundColor: SURFACE, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: BORDER },
  typingText:   { color: TEXT3, fontSize: 13 },
  inputBar:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, paddingBottom: Platform.OS === "ios" ? 20 : 12, backgroundColor: SURFACE, borderTopWidth: 1, borderTopColor: BORDER, gap: 8 },
  input:        { flex: 1, backgroundColor: BG, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: TEXT1, borderWidth: 1.5, borderColor: BORDER, maxHeight: 44 },
  sendBtn:      { backgroundColor: RED, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 22, shadowColor: RED, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4, elevation: 3 },
  sendBtnPressed:  { backgroundColor: RED_DARK },
  sendBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  sendBtnText:  { color: "#fff", fontWeight: "700", fontSize: 14 },
});
