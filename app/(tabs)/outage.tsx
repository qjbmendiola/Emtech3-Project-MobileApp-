import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "../../components/Map";

export default function Outage() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={styles.container}>

        {/* HEADER */}
        <Text style={styles.title}>Network Outage Map</Text>
        <Text style={styles.subtitle}>Last refreshed: 9:16 PM</Text>

        {/* MAP */}
        <View style={styles.mapWrapper}>
          <MapComponent />
        </View>

        {/* SCROLLABLE INFO */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.location}>Quezon City</Text>
            <Text>Status: Investigating</Text>
            <Text>Severity: High</Text>
            <Text>Affected Users: 240</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.location}>Novaliches</Text>
            <Text>Status: Monitoring</Text>
            <Text>Severity: Medium</Text>
            <Text>Affected Users: 120</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.location}>Manila</Text>
            <Text>Status: Resolved</Text>
            <Text>Severity: Low</Text>
            <Text>Affected Users: 60</Text>
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 🔥 VERY IMPORTANT
    backgroundColor: "#cfcfcf",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#ccc",
    marginBottom: 10,
  },

  mapWrapper: {
    height: 220,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
  },

  scrollContent: {
    paddingBottom: 80, // 🔥 prevents tab overlap
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  location: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});