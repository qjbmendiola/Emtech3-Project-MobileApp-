import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RouterGuide() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={styles.container}>

        <Text style={styles.title}>
          Cisco Router Configuration & Troubleshooting
        </Text>

        <View style={styles.content}>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cisco Router Assistant</Text>

            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Configuration Guide</Text>
            </Pressable>

            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Troubleshooting Guide</Text>
            </Pressable>
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cfcfcf",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  content: {
    flex: 1,                // 🔥 THIS FIXES THE EMPTY SPACE
    justifyContent: "flex-start",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#d32f2f",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});