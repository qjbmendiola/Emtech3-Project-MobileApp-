import { View, Text } from "react-native";

export default function MapComponent() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>🌐 Map is not supported on web</Text>
      <Text>Use mobile to view the map</Text>
    </View>
  );
}