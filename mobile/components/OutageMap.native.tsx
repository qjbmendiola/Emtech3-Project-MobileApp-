import MapView, { Marker, Heatmap } from "react-native-maps";
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

  // ✅ SAFE HEATMAP
  const heatmapPoints = outages
    .filter(
      (item) =>
        item.lat &&
        item.lng &&
        !isNaN(item.lat) &&
        !isNaN(item.lng)
    )
    .map((item) => ({
      latitude: item.lat,
      longitude: item.lng,
      weight: item.users || 1,
    }));

  // 🔥 AUTO FIT
  useEffect(() => {
    if (outages.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
        outages.map((o) => ({
          latitude: o.lat,
          longitude: o.lng,
        })),
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
      style={StyleSheet.absoluteFillObject} // 🔥 FULLSCREEN FIX
      initialRegion={{
        latitude: 14.5995,
        longitude: 120.9842,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}
    >
      {/* 🔥 HEATMAP */}
      {heatmapPoints.length > 0 && (
        <Heatmap points={heatmapPoints} />
      )}

      {/* 🔥 MARKERS */}
      {outages.map((item) => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: item.lat,
            longitude: item.lng,
          }}
          title={item.title}
          description={`${item.users} users`}
          onPress={() => onSelect?.(item)}
        />
      ))}
    </MapView>
  );
}