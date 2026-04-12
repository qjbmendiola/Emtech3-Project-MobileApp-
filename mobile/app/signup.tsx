import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const API_BASE = "https://outage-api-h3ko.onrender.com/api"; // ✅ Render URL

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();

  const [surname,       setSurname]       = useState("");
  const [firstName,     setFirstName]     = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [email,         setEmail]         = useState("");
  const [mobileNumber,  setMobileNumber]  = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [username,      setUsername]      = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const isMobileValid   = mobileNumber.length === 11;
  const isAccountValid  = accountNumber.length === 12;
  const isPasswordValid = password.length >= 8;

  const isFormValid =
    surname && firstName && email && username &&
    isMobileValid && isAccountValid && isPasswordValid;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSignup = async () => {
    if (!isFormValid) {
      triggerShake();
      return;
    }

    setLoading(true);

    // ✅ 30-second timeout for Render cold start
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surname,
          firstName,
          middleInitial,
          email,
          mobileNumber,
          accountNumber,
          username,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Signup Failed", data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      await login(data.user, data.token);
      router.replace("/(tabs)");

    } catch (error: any) {
      clearTimeout(timeout);
      console.log(error);

      if (error.name === "AbortError") {
        Alert.alert(
          "Server Waking Up",
          "The server is starting up. Please wait 30 seconds and try again."
        );
      } else {
        Alert.alert("Error", "Cannot connect to server. Please check your internet connection.");
      }
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
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

            <View style={styles.topRow}>
              <Text style={styles.title}>Create your account</Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.link}>Log In</Text>
              </Pressable>
            </View>

            <TextInput placeholder="Surname"    placeholderTextColor="#999" style={styles.input} value={surname}       onChangeText={setSurname} />
            <TextInput placeholder="First Name" placeholderTextColor="#999" style={styles.input} value={firstName}     onChangeText={setFirstName} />
            <TextInput placeholder="M.I."       placeholderTextColor="#999" style={styles.input} value={middleInitial} onChangeText={setMiddleInitial} />
            <TextInput placeholder="Email"      placeholderTextColor="#999" style={styles.input} value={email}         onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Mobile Number"
                placeholderTextColor="#999"
                style={[styles.inputFull, mobileNumber && (isMobileValid ? styles.validInput : styles.invalidInput)]}
                value={mobileNumber}
                keyboardType="numeric"
                onChangeText={(t) => setMobileNumber(t.replace(/[^0-9]/g, ""))}
              />
              {isMobileValid && <Ionicons name="checkmark-circle" size={20} color="green" style={styles.icon} />}
            </View>
            <Text style={[styles.hint, mobileNumber && (isMobileValid ? styles.validText : styles.invalidText)]}>
              Must be 11 digits
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Account Number"
                placeholderTextColor="#999"
                style={[styles.inputFull, accountNumber && (isAccountValid ? styles.validInput : styles.invalidInput)]}
                value={accountNumber}
                keyboardType="numeric"
                onChangeText={(t) => setAccountNumber(t.replace(/[^0-9]/g, ""))}
              />
              {isAccountValid && <Ionicons name="checkmark-circle" size={20} color="green" style={styles.icon} />}
            </View>
            <Text style={[styles.hint, accountNumber && (isAccountValid ? styles.validText : styles.invalidText)]}>
              Must be exactly 12 digits
            </Text>

            <TextInput placeholder="Username" placeholderTextColor="#999" style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

            <View style={styles.passwordWrap}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={styles.inputFlex}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="red" />
              </Pressable>
            </View>
            <Text style={[styles.hint, password && (isPasswordValid ? styles.validText : styles.invalidText)]}>
              At least 8 characters
            </Text>

            <Pressable
              style={[styles.signupBtn, (!isFormValid || loading) && { backgroundColor: "#aaa" }]}
              onPress={handleSignup}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupText}>Sign Up</Text>
              )}
            </Pressable>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: "#e9edf2" },
  container:     { flexGrow: 1, justifyContent: "center", padding: 20, paddingBottom: 50 },
  card:          { backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 5 },
  topRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title:         { fontSize: 22, fontWeight: "bold" },
  link:          { color: "red", fontWeight: "500" },
  input:         { backgroundColor: "#f1f3f6", padding: 12, borderRadius: 10, marginBottom: 10, elevation: 1, color: "#111" },
  inputContainer:{ position: "relative", marginBottom: 5 },
  inputFull:     { backgroundColor: "#f1f3f6", padding: 12, borderRadius: 10, paddingRight: 40, elevation: 1, color: "#111" },
  icon:          { position: "absolute", right: 12, top: 14 },
  validInput:    { borderColor: "green", borderWidth: 1.5 },
  invalidInput:  { borderColor: "red", borderWidth: 1.5 },
  passwordWrap:  { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f3f6", borderRadius: 10, paddingHorizontal: 10, marginBottom: 5 },
  inputFlex:     { flex: 1, paddingVertical: 12, color: "#111" },
  hint:          { fontSize: 12, marginBottom: 10, color: "#888" },
  validText:     { color: "green" },
  invalidText:   { color: "red" },
  signupBtn:     { backgroundColor: "#d32f2f", padding: 15, borderRadius: 30, alignItems: "center", marginTop: 10 },
  signupText:    { color: "#fff", fontWeight: "bold" },
});
