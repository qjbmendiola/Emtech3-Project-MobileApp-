import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>

        <View style={styles.card}>

          {/* TOP */}
          <View style={styles.topRow}>
            <Text style={styles.badge}>PLDT Smart Support</Text>

            <View style={styles.links}>
              <Pressable onPress={() => router.push("/")}>
                <Text style={styles.link}>Home</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/signup")}>
                <Text style={styles.link}>Sign Up</Text>
              </Pressable>
            </View>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Log in to continue to your account
          </Text>

          {/* INPUTS */}
          <Text style={styles.label}>Username</Text>
          <TextInput placeholder="Enter your username" style={styles.input} />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              style={styles.inputFlex}
            />
            <Text style={styles.show}>Show</Text>
          </View>

          {/* BUTTON */}
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text>Do not want to log in yet?</Text>

            <Pressable onPress={() => router.push("/")}>
              <Text style={styles.outlineBtn}>Go to Homepage</Text>
            </Pressable>
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
}

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

  links: {
    flexDirection: "row",
  },

  link: {
    color: "red",
    marginLeft: 10,
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
  },

  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },

  show: {
    color: "red",
    fontWeight: "bold",
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

  footer: {
    alignItems: "center",
    marginTop: 20,
  },

  outlineBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d32f2f",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    color: "#d32f2f",
  },
});