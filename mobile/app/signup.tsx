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

const API_BASE = "http://192.168.100.128:5000/api";

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

  // ── Validations ────────────────────────────────────────────────────────────
  const isMobileValid  = mobileNumber.length === 11;
  const isAccountValid = accountNumber.length === 12;
  const isPasswordValid = password.length >= 8;

  const isFormValid =
    surname && firstName && email && username &&
    isMobileValid && isAccountValid && isPasswordValid;

  // ── Shake animation ────────────────────────────────────────────────────────
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ── Signup handler — now actually calls the server ─────────────────────────
  const handleSignup = async () => {
    if (!isFormValid) {
      triggerShake();
      return;
    }

    setLoading(true);

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
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Signup Failed", data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto-login after successful signup
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
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

            {/* Header */}
            <View style={styles.topRow}>
              <Text style={styles.title}>Create your account</Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.link}>Log In</Text>
              </Pressable>
            </View>

            {/* Name fields */}
            <TextInput placeholder="Surname"    style={styles.input} value={surname}       onChangeText={setSurname} />
            <TextInput placeholder="First Name" style={styles.input} value={firstName}     onChangeText={setFirstName} />
            <TextInput placeholder="M.I."       style={styles.input} value={middleInitial} onChangeText={setMiddleInitial} />
            <TextInput placeholder="Email"      style={styles.input} value={email}         onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            {/* Mobile */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Mobile Number"
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

            {/* Account number */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Account Number"
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

            <TextInput placeholder="Username" style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

            {/* Password */}
            <View style={styles.passwordWrap}>
              <TextInput
                placeholder="Password"
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

            {/* Submit */}
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
  safe: { flex: 1, backgroundColor: "#e9edf2" },
  container: { flexGrow: 1, justifyContent: "center", padding: 20, paddingBottom: 50 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 5 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold" },
  link: { color: "red", fontWeight: "500" },
  input: { backgroundColor: "#f1f3f6", padding: 12, borderRadius: 10, marginBottom: 10, elevation: 1 },
  inputContainer: { position: "relative", marginBottom: 5 },
  inputFull: { backgroundColor: "#f1f3f6", padding: 12, borderRadius: 10, paddingRight: 40, elevation: 1 },
  icon: { position: "absolute", right: 12, top: 14 },
  validInput: { borderColor: "green", borderWidth: 1.5 },
  invalidInput: { borderColor: "red", borderWidth: 1.5 },
  passwordWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f3f6", borderRadius: 10, paddingHorizontal: 10, marginBottom: 5 },
  inputFlex: { flex: 1, paddingVertical: 12 },
  hint: { fontSize: 12, marginBottom: 10, color: "#888" },
  validText: { color: "green" },
  invalidText: { color: "red" },
  signupBtn: { backgroundColor: "#d32f2f", padding: 15, borderRadius: 30, alignItems: "center", marginTop: 10 },
  signupText: { color: "#fff", fontWeight: "bold" },
});
