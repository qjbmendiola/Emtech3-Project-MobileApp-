import MapView, { Marker } from "react-native-maps";
import { useRef, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Outage } from "../types/outage";

type Props = {
  outages?: Outage[];
  onSelect?: (item: Outage) => void;
  selected?: Outage | null;
};

export default function OutageMap({
  outages = [],
  onSelect,
  selected,
}: Props) {
  const mapRef = useRef<MapView | null>(null);

  // 🔥 AUTO FIT
  useEffect(() => {
    if (outages.length > 0 && mapRef.current) {
      const valid = outages.filter(
        (o) => o.lat && o.lng && !isNaN(o.lat) && !isNaN(o.lng)
      );
      if (valid.length === 0) return;

      mapRef.current.fitToCoordinates(
        valid.map((o) => ({ latitude: o.lat, longitude: o.lng })),
        {
          edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
          animated: true,
        }
      );
    }
  }, [outages]);

  // 🔥 ZOOM TO SELECTED
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: selected.lat,
          longitude: selected.lng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        800
      );
    }
  }, [selected]);

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
      {outages.map((item) => {
        // Guard bad coords — prevents native crash
        if (!item.lat || !item.lng || isNaN(item.lat) || isNaN(item.lng))
          return null;

        return (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.lat, longitude: item.lng }}
            title={item.title}
            description={`${item.users} users affected`}
            onPress={() => onSelect?.(item)}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({});
