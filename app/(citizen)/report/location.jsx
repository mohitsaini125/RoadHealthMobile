import React, { useCallback, useEffect, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Button, ErrorBanner, Loading } from "../../../src/components/ui";
import { getDraft, setDraft } from "../../../src/utils/draft";
import { colors, radius } from "../../../src/utils/theme";

export default function LocationStep() {
  const router = useRouter();
  const [coords, setCoords] = useState(
    getDraft().latitude != null ? { latitude: getDraft().latitude, longitude: getDraft().longitude } : null
  );
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(null);

  const locate = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDenied(true);
        return;
      }
      setDenied(false);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      setError("Couldn't get your location. Make sure GPS is on and try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!coords) locate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    setDraft({ latitude: coords.latitude, longitude: coords.longitude });
    router.push("/(citizen)/report/preview");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 15, color: colors.slate, lineHeight: 22, marginBottom: 16 }}>
        Stand near the damage. Your GPS position tells authorities where to send a repair crew.
      </Text>

      {denied ? (
        <View>
          <ErrorBanner message="Location permission is required to report road damage. Allow location access in Settings, then try again." />
          <Button title="Open Settings" onPress={() => Linking.openSettings()} variant="dark" style={{ marginBottom: 10 }} />
          <Button title="Try again" onPress={locate} variant="outline" />
        </View>
      ) : busy ? (
        <View style={{ height: 200 }}><Loading label="Finding your location" /></View>
      ) : (
        <View>
          <ErrorBanner message={error} onRetry={locate} />
          {coords ? (
            <View style={{ backgroundColor: "#fff", borderRadius: radius.md, padding: 18, borderWidth: 1, borderColor: colors.line, marginBottom: 18 }}>
              <Text style={{ fontSize: 13, color: colors.slate }}>Latitude</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.asphalt, marginBottom: 10 }}>{coords.latitude.toFixed(6)}</Text>
              <Text style={{ fontSize: 13, color: colors.slate }}>Longitude</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.asphalt }}>{coords.longitude.toFixed(6)}</Text>
            </View>
          ) : null}
          <Button title="Continue" onPress={next} disabled={!coords} style={{ marginBottom: 10 }} />
          <Button title={coords ? "Refresh location" : "Get location"} onPress={locate} variant="outline" />
        </View>
      )}
    </ScrollView>
  );
}
