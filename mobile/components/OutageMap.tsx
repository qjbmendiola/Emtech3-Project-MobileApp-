import { View, Text, Pressable } from "react-native";
import { Outage } from "../types/outage";

type Props = {
  outages?: Outage[];
  onSelect?: (item: Outage) => void;
  selected?: Outage | null;
};

export default function OutageMap({
  outages = [],
  onSelect,
}: Props) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        🌐 Outage Map (Web Preview)
      </Text>

      {outages.map((item) => (
        <Pressable key={item.id} onPress={() => onSelect?.(item)}>
          <Text>
            {item.title} - {item.severity} ({item.users})
          </Text>
        </Pressable>
      ))}
    </View>
  );
}