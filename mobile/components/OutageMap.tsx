import { View, Text, StyleSheet, Pressable } from "react-native";

type Outage = {
  id: number;
  title: string;
  severity: string;
  users: number;
};

type Props = {
  outages?: Outage[]; // ✅ optional
  onSelect?: (item: Outage) => void;
};

export default function OutageMap({ outages = [], onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Outage Map (Web Preview)</Text>

      {outages.map((o) => (
        <Pressable
          key={o.id}
          style={styles.card}
          onPress={() => onSelect?.(o)}
        >
          <Text style={{ fontWeight: "bold" }}>{o.title}</Text>
          <Text>Severity: {o.severity}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
});