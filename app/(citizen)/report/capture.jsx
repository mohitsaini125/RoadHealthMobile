import React, { useState } from "react";
import { Alert, Image, Linking, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button, ErrorBanner } from "../../../src/components/ui";
import { getDraft, setDraft } from "../../../src/utils/draft";
import { colors, radius } from "../../../src/utils/theme";

const PICKER_OPTS = { mediaTypes: ["images"], quality: 0.7, allowsEditing: false };

export default function Capture() {
  const router = useRouter();
  // Seed from draft so the chosen photo survives a back-navigate.
  const [uri, setUri] = useState(getDraft().imageUri || null);
  const [error, setError] = useState(null);
  // Prevent double-tap on Continue while the navigator is animating.
  const [navigating, setNavigating] = useState(false);

  const deniedAlert = (what) =>
    Alert.alert(
      `${what} access needed`,
      `Allow ${what.toLowerCase()} access in Settings to add a photo.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );

  const take = async () => {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return deniedAlert("Camera");
    try {
      const res = await ImagePicker.launchCameraAsync(PICKER_OPTS);
      if (!res.canceled && res.assets?.[0]?.uri) setUri(res.assets[0].uri);
    } catch (e) {
      setError("Couldn't open the camera. Please try again.");
    }
  };

  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return deniedAlert("Photo library");
    try {
      const res = await ImagePicker.launchImageLibraryAsync(PICKER_OPTS);
      if (!res.canceled && res.assets?.[0]?.uri) setUri(res.assets[0].uri);
    } catch (e) {
      setError("Couldn't open your photos. Please try again.");
    }
  };

  const next = () => {
    if (!uri || navigating) return;   // guard: no image or already navigating
    setNavigating(true);
    try {
      setDraft({ imageUri: uri });    // persist before navigation
      router.push("/(citizen)/report/location");
    } catch (e) {
      // Navigation failed — reset so the user can retry
      setNavigating(false);
      setError("Navigation failed. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 15, color: colors.slate, marginBottom: 14, lineHeight: 22 }}>
        Photograph the damage so the whole affected area is visible.
      </Text>

      <ErrorBanner message={error} />

      {/* Photo preview */}
      <View
        style={{
          aspectRatio: 4 / 3,
          borderRadius: radius.md,
          backgroundColor: "#E4E9ED",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Text style={{ color: colors.slate }}>No photo yet</Text>
        )}
      </View>

      {/* Camera / Library buttons */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <Button
          title={uri ? "Retake" : "Use camera"}
          onPress={take}
          variant="dark"
          style={{ flex: 1 }}
          disabled={navigating}
        />
        <Button
          title="Choose photo"
          onPress={pick}
          variant="outline"
          style={{ flex: 1 }}
          disabled={navigating}
        />
      </View>

      {/*
        disabled when no image yet.
        loading shows a spinner while the navigator transitions so the user
        gets immediate visual feedback and cannot double-tap.
      */}
      <Button
        title="Continue"
        onPress={next}
        disabled={!uri}
        loading={navigating}
      />
    </ScrollView>
  );
}
