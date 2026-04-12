import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
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
  const webViewRef = useRef<WebView | null>(null);

  // Send updated markers to the WebView when outages change
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "SET_MARKERS", outages })
      );
    }
  }, [outages]);

  // Zoom to selected outage
  useEffect(() => {
    if (selected && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "SELECT", lat: selected.lat, lng: selected.lng })
      );
    }
  }, [selected]);

  // Handle marker tap from WebView → call onSelect
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MARKER_PRESS" && onSelect) {
        const found = outages.find((o) => String(o.id) === String(data.id));
        if (found) onSelect(found);
      }
    } catch (_) {}
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([14.5995, 120.9842], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var markers = [];

    function severityColor(severity) {
      if (severity === 'High')   return '#E53935';
      if (severity === 'Medium') return '#f97316';
      return '#16a34a';
    }

    function clearMarkers() {
      markers.forEach(function(m) { map.removeLayer(m); });
      markers = [];
    }

    function setMarkers(outages) {
      clearMarkers();
      var valid = outages.filter(function(o) {
        return o.lat && o.lng && !isNaN(o.lat) && !isNaN(o.lng);
      });

      valid.forEach(function(o) {
        var color = severityColor(o.severity);

        var icon = L.divIcon({
          className: '',
          html: '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        var marker = L.marker([o.lat, o.lng], { icon: icon })
          .addTo(map)
          .bindPopup(
            '<b>' + o.title + '</b><br>' +
            '<span style="color:' + color + '">' + o.severity + '</span><br>' +
            o.users + ' users affected'
          );

        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MARKER_PRESS',
            id: o.id
          }));
        });

        markers.push(marker);
      });

      if (valid.length > 0) {
        var group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.3));
      }
    }

    // Listen for messages from React Native (Android uses document, iOS uses window)
    document.addEventListener('message', handleRNMessage);
    window.addEventListener('message', handleRNMessage);

    function handleRNMessage(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'SET_MARKERS') setMarkers(data.outages);
        if (data.type === 'SELECT') {
          map.setView([data.lat, data.lng], 13, { animate: true });
        }
      } catch(e) {}
    }
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
});
