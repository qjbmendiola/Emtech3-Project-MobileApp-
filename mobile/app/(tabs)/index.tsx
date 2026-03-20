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

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [showOutage, setShowOutage] = useState(false);
  const [showRouter, setShowRouter] = useState(false);

  const [info, setInfo] = useState<any>(null);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        style={{ zIndex: 1 }} // 🔥 IMPORTANT FIX
      >

        {/* 🔴 HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>PLDT Smart</Text>

          <View style={{ position: "relative" }}>
            <Pressable onPress={() => setMenuOpen(!menuOpen)}>
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
            </Pressable>

            {menuOpen && (
              <View style={styles.dropdown}>
                <Text style={styles.dropdownUser}>{user}</Text>

                <Pressable onPress={handleLogout}>
                  <Text style={styles.dropdownItem}>Logout</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* 🟢 STATUS */}
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>🟢 Stable Connection</Text>
        </View>

        {/* 🤖 AI NETWORK ASSISTANT */}
        <Pressable
          style={styles.mainCard}
          onPress={() => setShowChat(!showChat)}
        >
          <View style={styles.row}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
            <Text style={styles.mainTitle}>AI Network Assistant</Text>

            <Ionicons
              name={showChat ? "chevron-up" : "chevron-down"}
              size={18}
              color="#fff"
              style={{ marginLeft: "auto" }}
            />
          </View>

          {showChat && (
            <View style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>
                Recent:
                {"\n"}• Slow internet
                {"\n"}• LOS blinking
                {"\n"}• No connection
              </Text>

              <Pressable onPress={() => router.push("/chat")}>
                <Text style={styles.link}>Open Chat →</Text>
              </Pressable>
            </View>
          )}
        </Pressable>

        {/* 🗺️ LIVE OUTAGE MAP */}
        <Pressable
          style={styles.mainCard}
          onPress={() => setShowOutage(!showOutage)}
        >
          <View style={styles.row}>
            <Ionicons name="map" size={22} color="#fff" />
            <Text style={styles.mainTitle}>Live Outage Map</Text>

            <Ionicons
              name={showOutage ? "chevron-up" : "chevron-down"}
              size={18}
              color="#fff"
              style={{ marginLeft: "auto" }}
            />
          </View>

          {showOutage && (
            <View style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>
                🔴 QC – No internet{"\n"}
                🟡 Manila – Slow{"\n"}
                🟢 Cebu – Stable
              </Text>
            </View>
          )}
        </Pressable>

        {/* ⚙️ ROUTER TROUBLESHOOTER */}
        <Pressable
          style={styles.mainCard}
          onPress={() => setShowRouter(!showRouter)}
        >
          <View style={styles.row}>
            <Ionicons name="settings" size={22} color="#fff" />
            <Text style={styles.mainTitle}>Router Troubleshooter</Text>

            <Ionicons
              name={showRouter ? "chevron-up" : "chevron-down"}
              size={18}
              color="#fff"
              style={{ marginLeft: "auto" }}
            />
          </View>

          {showRouter && (
            <View style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>
                Fix common issues:
                {"\n"}• No internet
                {"\n"}• Slow speed
                {"\n"}• LOS red
              </Text>
            </View>
          )}
        </Pressable>

        {/* ⚡ QUICK BUTTONS */}
        <View style={styles.quickRow}>
          <Pressable
            style={styles.quickBtn}
            onPress={() =>
              setInfo("Check your internet speed performance.\n\nThis will help you see if your connection is slow, unstable, or working normally. Recommended when experiencing lag, buffering, or delays.")
            }
          >
            <Ionicons name="wifi" size={22} color="#d32f2f" />
            <Text>Speed</Text>
          </Pressable>

          <Pressable
            style={styles.quickBtn}
            onPress={() =>
              setInfo("Report an internet outage in your area.\n\nYour report helps other users see real-time issues and improves outage tracking across the Philippines.")
            }
          >
            <Ionicons name="alert-circle" size={22} color="#d32f2f" />
            <Text>Report</Text>
          </Pressable>

          <Pressable
            style={styles.quickBtn}
            onPress={() =>
              setInfo("Get help with your internet connection.\n\nUse the AI Network Assistant to troubleshoot issues like no internet, slow speed, or router problems instantly.")
            }
          >
            <Ionicons name="help-circle" size={22} color="#d32f2f" />
            <Text>Help</Text>
          </Pressable>
        </View>

        {/* 🔥 INFO BOX */}
        {info && (
          <View style={styles.infoBox}>
            <Text>{info}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

//////////////////////////////////////////////////////////
// 🎨 STYLES
//////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f6f9" },
  container: { padding: 15 },

  // 🔥 FIXED HEADER LAYER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#d32f2f",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,

    position: "relative",
    zIndex: 999,
  },

  logo: { color: "#fff", fontWeight: "bold" },

  // 🔥 FIXED DROPDOWN (ON TOP)
  dropdown: {
    position: "absolute",
    top: 45,
    right: 0,

    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: 150,

    zIndex: 9999,
    elevation: 50,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  dropdownUser: { fontWeight: "bold", marginBottom: 5 },
  dropdownItem: { color: "#d32f2f", fontWeight: "bold" },

  statusCard: {
    backgroundColor: "#e8f5e9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },

  statusText: { color: "green", fontWeight: "bold" },

  mainCard: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  mainTitle: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  dropdownBox: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ff5252",
  },

  dropdownText: {
    color: "#333",
    fontSize: 12,
  },

  link: {
    color: "#d32f2f",
    marginTop: 6,
    fontWeight: "bold",
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  quickBtn: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "30%",
  },

  infoBox: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#d32f2f",
  },
});