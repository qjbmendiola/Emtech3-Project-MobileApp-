import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState, useEffect } from "react";

// ✅ STORAGE FIX
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  /////////////////////////////////////////////////////////
  // 🔥 LOAD USER (FIXED)
  /////////////////////////////////////////////////////////
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (Platform.OS === "web") {
          const storedUser = localStorage.getItem("user");
          if (storedUser) setUser(JSON.parse(storedUser));
        } else {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log("Error loading user:", e);
      }
    };

    loadUser();
  }, []);

  /////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* 🔴 HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>PLDT Smart</Text>

          <View style={{ position: "relative", zIndex: 1000 }}>
            <Pressable onPress={() => setMenuOpen(!menuOpen)}>
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
            </Pressable>

            {menuOpen && (
               <View style={styles.dropdown}>
                 <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.dropdownItem}>Sign In</Text>
                </Pressable>

                <Pressable onPress={() => router.push("/signup")}>
                  <Text style={styles.dropdownItem}>Register</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View> 

        {/* 🎁 CARD */}
        <Card>
          <View style={styles.row}>
            <Ionicons name="gift-outline" size={22} color="#d32f2f" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.bold}>Invite Friends</Text>
              <Text style={styles.small}>Earn rewards by sharing</Text>
            </View>
          </View>
        </Card>

        {/* 🔥 MAIN DASHBOARD */}
        <Card style={styles.mainCard}>
          <Text style={styles.cardLabel}>Support Dashboard</Text>

          {/* 👇 USER GREETING */}
          <Text style={styles.bigText}>
            Hi, {user?.username || "Guest"} 👋
          </Text>

          <View style={styles.rowBetween}>
            <AnimatedButton
              label="Chat Support"
              onPress={() => router.push("/chat")}
            />
            <AnimatedButton
              label="Outage Map"
              onPress={() => router.push("/outage")}
              secondary
            />
          </View>
        </Card>

        {/* 🟡 RECENT ACTIVITY */}
        {user && (
          <Card>
            <Text style={styles.bold}>Recent Activity</Text>
            <Text style={styles.activity}>• Asked about slow internet</Text>
            <Text style={styles.activity}>• Checked outage (QC)</Text>
            <Text style={styles.activity}>• Opened router guide</Text>
          </Card>
        )}

        {/* 📦 FEATURES */}
        <Feature
          icon="chatbubble-ellipses"
          title="AI Chatbot"
          desc="Ask anytime"
          onPress={() => router.push("/chat")}
        />

        <Feature
          icon="map"
          title="Outage Map"
          desc="Check interruptions"
          onPress={() => router.push("/outage")}
        />

        <Feature
          icon="settings"
          title="Router Setup"
          desc="Fix connection"
          onPress={() => router.push("/router")}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

//////////////////////////////////////////////////////////
// 🔧 COMPONENTS
//////////////////////////////////////////////////////////

function Card({ children, style }: any) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function AnimatedButton({ label, onPress, secondary }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
        }
        onPress={onPress}
        style={[
          styles.button,
          secondary ? styles.secondaryBtn : styles.primaryBtn,
        ]}
      >
        <Text style={secondary ? styles.secondaryText : styles.primaryText}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function Feature({ icon, title, desc, onPress }: any) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable style={styles.feature} onPress={() => setOpen(!open)}>
      <Ionicons name={icon} size={24} color="#d32f2f" />

      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>

        {open && (
          <Text style={styles.dropdownInfo}>
            {title === "AI Chatbot" &&
              "Instant answers and troubleshooting."}
            {title === "Outage Map" &&
              "View affected areas and updates."}
            {title === "Router Setup" &&
              "Step-by-step configuration guide."}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

//////////////////////////////////////////////////////////
// 🎨 STYLES
//////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f6f9" },

  container: { padding: 15, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#d32f2f",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,

    position: "relative",   // 👈 REQUIRED
    zIndex: 999,            // 👈 BRING TO FRONT
  },
  logo: { color: "#fff", fontWeight: "bold", fontSize: 18 },

 dropdown: {
  position: "absolute",
  top: 45,
  right: 0,

  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 10,
  width: 140,

  zIndex: 1000,     // 👈 HIGHER THAN HEADER
  elevation: 20,    // 👈 ANDROID FIX

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 6,
},

  dropdownItem: {
    paddingVertical: 8,
    textAlign: "center",
    color: "#d32f2f",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
  },

  mainCard: { backgroundColor: "#d32f2f" },

  cardLabel: { color: "#fff", fontSize: 12 },

  bigText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },

  row: { flexDirection: "row", alignItems: "center" },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },

  primaryBtn: { backgroundColor: "#fff" },
  secondaryBtn: { backgroundColor: "#000" },

  primaryText: { color: "#d32f2f", fontWeight: "bold" },
  secondaryText: { color: "#fff", fontWeight: "bold" },

  feature: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  featureTitle: { fontWeight: "bold" },
  featureDesc: { fontSize: 12, color: "#666" },

  dropdownInfo: {
    marginTop: 8,
    fontSize: 12,
    color: "#444",
  },

  activity: { fontSize: 12, marginTop: 5, color: "#555" },

  bold: { fontWeight: "bold" },
  small: { fontSize: 12, color: "#666" },
});