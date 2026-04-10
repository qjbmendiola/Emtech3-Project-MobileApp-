import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://192.168.100.128:5000/api";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      await login(data.user, data.token);
      router.replace("/(tabs)");

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Cannot connect to server. Make sure the server is running.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>

            <View style={styles.topRow}>
              <Text style={styles.badge}>ISP Smart Support</Text>
              <Pressable onPress={() => router.push("/signup")}>
                <Text style={styles.link}>Sign Up</Text>
              </Pressable>
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to continue to your account</Text>

            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              placeholder="Enter your username or email"
              placeholderTextColor="#999"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#999"
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

            <Pressable
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Log In</Text>
              )}
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#e9edf2" },
  container:    { flexGrow: 1, justifyContent: "center", padding: 20 },
  card:         { backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 5 },
  topRow:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  badge:        { backgroundColor: "#e3ecf5", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, fontSize: 12 },
  link:         { color: "red", fontWeight: "500" },
  title:        { fontSize: 26, fontWeight: "bold", marginTop: 10 },
  subtitle:     { marginBottom: 15, color: "#555" },
  label:        { marginTop: 10, marginBottom: 5 },
  input:        { backgroundColor: "#f1f3f6", padding: 12, borderRadius: 10, color: "#111" },
  passwordWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f3f6", borderRadius: 10, paddingHorizontal: 10, justifyContent: "space-between" },
  inputFlex:    { flex: 1, paddingVertical: 12, color: "#111" },
  loginBtn:     { backgroundColor: "#d32f2f", padding: 15, borderRadius: 30, alignItems: "center", marginTop: 20 },
  loginText:    { color: "#fff", fontWeight: "bold" },
});
