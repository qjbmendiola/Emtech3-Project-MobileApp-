import { View, Text, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import OutageMap from "../../components/OutageMap";

type Outage = {
  id: number;
  title: string;
  severity: string;
  users: number;
  lat: number;
  lng: number;
};

export default function OutageScreen() {
  const [selected, setSelected] = useState<Outage | null>(null);

  // ✅ ALWAYS DEFINE DATA
  const outages: Outage[] = [
    {
      id: 1,
      title: "Quezon City",
      severity: "High",
      users: 240,
      lat: 14.6760,
      lng: 121.0437,
    },
    {
      id: 2,
      title: "Manila",
      severity: "Medium",
      users: 120,
      lat: 14.5995,
      lng: 120.9842,
    },
    {
      id: 3,
      title: "Cebu",
      severity: "Low",
      users: 60,
      lat: 10.3157,
      lng: 123.8854,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* 🔥 SAFE PASS */}
      <OutageMap outages={outages || []} onSelect={setSelected} />

      {/* 📊 INFO PANEL */}
      {selected && (
        <View style={styles.info}>
          <Text style={styles.title}>{selected.title}</Text>

          <Text>
            Severity:{" "}
            <Text
              style={{
                color:
                  selected.severity === "High"
                    ? "red"
                    : selected.severity === "Medium"
                    ? "orange"
                    : "green",
                fontWeight: "bold",
              }}
            >
              {selected.severity}
            </Text>
          </Text>

          <Text>Affected Users: {selected.users}</Text>

          <Pressable
            style={styles.closeBtn}
            onPress={() => setSelected(null)}
          >
            <Text style={{ color: "#fff" }}>Close</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  info: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 10,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#d32f2f",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});