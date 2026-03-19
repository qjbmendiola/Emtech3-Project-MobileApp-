import MapView, { Marker } from "react-native-maps";

export default function MapComponent() {
  return (
    <MapView
      style={{ height: 250, borderRadius: 15 }}
      initialRegion={{
        latitude: 14.5995,
        longitude: 120.9842,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      <Marker
        coordinate={{ latitude: 14.6760, longitude: 121.0437 }}
        title="Quezon City"
        pinColor="red"
      />

      <Marker
        coordinate={{ latitude: 14.7369, longitude: 121.0509 }}
        title="Novaliches"
        pinColor="orange"
      />
    </MapView>
  );
}