import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Button, ErrorBanner, Loading } from "../../../src/components/ui";
import { getDraft, setDraft } from "../../../src/utils/draft";
import { colors, radius } from "../../../src/utils/theme";

// On a physical Android device, Accuracy.Balanced fixes in ~1-2 s.
// Accuracy.High can hang for 30+ s when cold-starting GPS outdoors,
// and will never resolve indoors — causing an apparent frozen screen.
const ACCURACY = Location.Accuracy.Balanced;

// Hard cap so the user is never left on an infinite loading screen.
const GPS_TIMEOUT_MS = 20000;

export default function LocationStep() {
  const router = useRouter();

  // Seed from draft if the user is returning after a back-navigate.
  const draft = getDraft();
  const [coords, setCoords] = useState(
    draft.latitude != null && draft.longitude != null
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null
  );
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(null);

  // Track mount state so we never call setState after unmount.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const locate = useCallback(async () => {
    if (!mounted.current) return;
    setBusy(true);
    setError(null);
    setDenied(false);

    try {
      // 1. Ask for permission (shows system dialog on first call).
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current) return;

      if (status !== "granted") {
        setDenied(true);
        return; // finally will setBusy(false)
      }

      // 2. Race GPS against a hard timeout so we never freeze.
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("GPS timed out. Move to an open area and try again.")),
          GPS_TIMEOUT_MS
        )
      );
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: ACCURACY }),
        timeoutPromise,
      ]);

      if (!mounted.current) return;
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      if (!mounted.current) return;
      setError(e.message || "Couldn't get your location. Make sure GPS is on and try again.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, []); // locate never changes identity

  // Auto-locate on first mount only when no coords are cached in the draft.
  useEffect(() => {
    if (!coords) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check permission when the user returns from the Settings app.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && denied) {
        // Re-run so the permission dialog result is picked up.
        locate();
      }
    });
    return () => sub.remove();
  }, [denied, locate]);

  const next = () => {
    // Guard: should not be reachable when coords is null (button is disabled),
    // but protect defensively against race conditions.
    if (!coords) return;
    setDraft({ latitude: coords.latitude, longitude: coords.longitude });
    router.push("/(citizen)/report/preview");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 15, color: colors.slate, lineHeight: 22, marginBottom: 16 }}>
        Stand near the damage. Your GPS position tells authorities where to send a repair crew.
      </Text>

      {denied ? (
        /* ── Permission denied branch ── */
        <View>
          <ErrorBanner message="Location permission is required to report road damage. Allow location access in Settings, then try again." />
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()}
            variant="dark"
            style={{ marginBottom: 10 }}
          />
          <Button title="Try again" onPress={locate} variant="outline" />
        </View>

      ) : busy ? (
        /* ── Loading branch ── */
        <View style={{ height: 200 }}>
          <Loading label="Finding your location…" />
        </View>

      ) : (
        /* ── Normal / error branch ── */
        <View>
          {/* Retry-able error banner */}
          <ErrorBanner message={error} onRetry={locate} />

          {/* Coordinate card — only shown when we have a fix */}
          {coords ? (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: radius.md,
                padding: 18,
                borderWidth: 1,
                borderColor: colors.line,
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.slate }}>Latitude</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.asphalt, marginBottom: 10 }}>
                {coords.latitude.toFixed(6)}
              </Text>
              <Text style={{ fontSize: 13, color: colors.slate }}>Longitude</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.asphalt }}>
                {coords.longitude.toFixed(6)}
              </Text>
            </View>
          ) : null}

          <Button
            title="Continue"
            onPress={next}
            disabled={!coords}
            style={{ marginBottom: 10 }}
          />
          <Button
            title={coords ? "Refresh location" : "Get location"}
            onPress={locate}
            variant="outline"
          />
        </View>
      )}
    </ScrollView>
  );
}
