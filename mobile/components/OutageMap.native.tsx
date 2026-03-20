import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRef } from "react";

type Outage = {
  id: number;
  title: string;
  severity: string;
  users: number;
  lat: number;
  lng: number;
};

type Props = {
  outages: Outage[];
  onSelect: (item: Outage) => void;
};

export default function OutageMap({ outages, onSelect }: Props) {
  const mapRef = useRef<any>(null);

  const handlePress = (o: Outage) => {
    onSelect(o);

    // 🔥 ZOOM TO LOCATION
    mapRef.current?.animateToRegion(
      {
        latitude: o.lat,
        longitude: o.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      1000
    );
  };

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: 14.5995,
        longitude: 120.9842,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}
    >
      {outages.map((o) => (
        <Marker
          key={o.id}
          coordinate={{ latitude: o.lat, longitude: o.lng }}
          onPress={() => handlePress(o)}
          pinColor={
            o.severity === "High"
              ? "red"
              : o.severity === "Medium"
              ? "orange"
              : "green"
          }
        />
      ))}
    </MapView>
  );
}