import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

// ✅ AUTH
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState(""); // 🔥 EMAIL
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 🔥 LOADING

  // 🔐 MOCK ACCOUNT
  const MOCK_EMAIL = "admin@gmail.com";
  const MOCK_PASS = "admin123";

  /////////////////////////////////////////////////////////
  // 🔥 EMAIL VALIDATION
  /////////////////////////////////////////////////////////
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  /////////////////////////////////////////////////////////

  const handleLogin = async () => {
    // ❌ empty
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // ❌ invalid email
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Enter a valid email address");
      return;
    }

    // ❌ short password
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters");
      return;
    }

    setLoading(true); // 🔥 START LOADING

    setTimeout(async () => {
      if (email === MOCK_EMAIL && password === MOCK_PASS) {
        await login(email);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
      }

      setLoading(false); // 🔥 STOP LOADING
    }, 1200); // simulate network delay
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.card}>

          {/* TOP */}
          <View style={styles.topRow}>
            <Text style={styles.badge}>PLDT Smart Support</Text>

            <Pressable onPress={() => router.push("/signup")}>
              <Text style={styles.link}>Sign Up</Text>
            </Pressable>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Log in to continue to your account
          </Text>

          {/* EMAIL */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* PASSWORD */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="red"
              />
            </Pressable>
          </View>

          {/* LOGIN BUTTON */}
          <Pressable
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Log In</Text>
            )}
          </Pressable>

          {/* TEST ACCOUNT */}
          <Text style={{ textAlign: "center", marginTop: 10, color: "#888" }}>
            Test: admin@gmail.com / admin123
          </Text>

        </View>
      </View>
    </SafeAreaView>
  );
}

//////////////////////////////////////////////////////////
// 🎨 STYLES
//////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e9edf2",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  badge: {
    backgroundColor: "#e3ecf5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
  },

  link: {
    color: "red",
    fontWeight: "500",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
  },

  subtitle: {
    marginBottom: 15,
    color: "#555",
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#f1f3f6",
    padding: 12,
    borderRadius: 10,
  },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },

  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },

  loginBtn: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  loginText: {
    color: "#fff",
    fontWeight: "bold",
  },
});