import MapView, { Marker } from "react-native-maps";

export default function MapComponent() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 14.676,
        longitude: 121.043,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker
        coordinate={{ latitude: 14.676, longitude: 121.043 }}
        title="Quezon City"
        description="High outage reported"
      />
    </MapView>
  );
}