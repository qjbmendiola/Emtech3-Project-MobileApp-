import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import OutageMap from "../../components/OutageMap";
import { getOutages } from "../../services/outageService";
import { Outage } from "../../types/outage";

const RED = "#E53935";

function severityColor(severity: string) {
  if (severity === "High") return RED;
  if (severity === "Medium") return "#f97316";
  return "#16a34a";
}

export default function OutageScreen() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [selected, setSelected] = useState<Outage | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getOutages();
      setOutages(data);
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Outage Map</Text>
      </View>

      {/* MAP */}
      <View style={{ flex: 1 }}>
        <OutageMap
          outages={outages}
          selected={selected}
          onSelect={(item) => setSelected(item)}
        />

        {/* 🔥 PANEL */}
        {selected && (
          <View style={styles.panel}>
            <Text style={styles.title}>{selected.title}</Text>

            <Text style={{ color: severityColor(selected.severity) }}>
              {selected.severity}
            </Text>

            <Text>Users: {selected.users}</Text>

            <Pressable
              style={styles.button}
              onPress={() => setSelected(null)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </Pressable>
          </View>
        )}

        {/* 🔥 FLOATING LIST */}
        <View style={styles.bottomList}>
          <Text style={styles.listTitle}>Live Outages</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {outages.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => setSelected(item)}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>

                <Text style={{ color: severityColor(item.severity) }}>
                  {item.severity}
                </Text>

                <Text style={styles.users}>
                  {item.users} users
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: RED,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  panel: {
    position: "absolute",
    bottom: 160, // above list
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
  },

  button: {
    marginTop: 10,
    backgroundColor: RED,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  bottomList: {
    position: "absolute",
    bottom: 0, // above tab bar
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  listTitle: {
    fontWeight: "700",
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 10,
    width: 140,
  },

  cardTitle: {
    fontWeight: "800",
  },

  users: {
    fontSize: 12,
    color: "#999",
  },
});