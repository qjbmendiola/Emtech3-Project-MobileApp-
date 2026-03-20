import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Signup() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.card}>

          {/* TOP */}
          <View style={styles.topRow}>
            <Text style={styles.badge}>PLDT Smart Support</Text>

            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.link}>Log In</Text>
            </Pressable>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Sign up to manage your PLDT support portal access
          </Text>

          {/* INPUTS */}
          <TextInput placeholder="Surname" style={styles.input} />
          <TextInput placeholder="First Name" style={styles.input} />
          <TextInput placeholder="M.I." style={styles.input} />

          <TextInput placeholder="Email" style={styles.input} />
          <TextInput placeholder="Mobile Number" style={styles.input} />
          <TextInput placeholder="PLDT Account Number" style={styles.input} />
          <TextInput placeholder="Username" style={styles.input} />

          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.inputFlex}
            />
            <Text style={styles.show}>Show</Text>
          </View>

          {/* BUTTON */}
          <Pressable
            style={styles.signupBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e9edf2",
  },

  container: {
    padding: 20,
    justifyContent: "center",
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

  input: {
    backgroundColor: "#f1f3f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },

  show: {
    color: "red",
    fontWeight: "bold",
  },

  signupBtn: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  signupText: {
    color: "#fff",
    fontWeight: "bold",
  },
});