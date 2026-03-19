import { View, Text } from "react-native";

export default function MapComponent() {
  return (
    <View
      style={{
        height: 250,
        borderRadius: 15,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff" }}>
        Map not available on web
      </Text>
    </View>
  );
}