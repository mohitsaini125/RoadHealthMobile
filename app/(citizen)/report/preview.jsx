import React, { useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { submitReport } from "../../../src/api/reports";
import { Button, ErrorBanner, Row } from "../../../src/components/ui";
import { getDraft, setDraft } from "../../../src/utils/draft";
import { colors, radius } from "../../../src/utils/theme";

export default function Preview() {
  const router = useRouter();

  // Snapshot draft values at mount time.
  // getDraft() returns the same mutable object, so snapshot the fields we need
  // to avoid accidentally reading values that a concurrent setDraft() modifies.
  const draftRef = useRef(getDraft());
  const { imageUri, latitude, longitude } = draftRef.current;

  const [description, setDescription] = useState(draftRef.current.description || "");
  const [phase, setPhase] = useState(null); // null | "Uploading image…" | "Analysing road…"
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  // Track mount state so we never call setState after router.replace fires.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Guard: if the draft is missing required fields (user somehow reached
  // preview without completing earlier steps), go back rather than crash.
  useEffect(() => {
    if (!imageUri || latitude == null || longitude == null) {
      router.back();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async () => {
    if (inFlight.current) return; // prevent duplicate taps
    inFlight.current = true;
    if (mounted.current) {
      setError(null);
      setPhase("Uploading image…");
    }

    // Persist the description before the async call in case submit succeeds.
    setDraft({ description });

    const phaseTimer = setTimeout(() => {
      if (mounted.current) setPhase("Analysing road…");
    }, 1800);

    try {
      const result = await submitReport({
        latitude,
        longitude,
        description: description.trim(),
        imageUri,
      });
      setDraft({ result });
      // Navigate immediately; don't wait for React state updates.
      router.replace("/(citizen)/report/result");
    } catch (e) {
      if (mounted.current) {
        setError(`${e.message}\n\nYour photo and location are kept — you can retry.`);
      }
    } finally {
      clearTimeout(phaseTimer);
      // Only reset UI state if we are still on this screen
      // (navigation to result may have already unmounted us).
      if (mounted.current) {
        setPhase(null);
        inFlight.current = false;
      }
    }
  };

  // If the draft guard above redirects us, render nothing so we don't
  // briefly show a broken preview with null values.
  if (!imageUri || latitude == null || longitude == null) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={error} />

        {/* Road-damage photo */}
        <Image
          source={{ uri: imageUri }}
          style={{
            width: "100%",
            aspectRatio: 4 / 3,
            borderRadius: radius.md,
            backgroundColor: "#E4E9ED",
            marginBottom: 14,
          }}
          resizeMode="cover"
        />

        {/* Coordinate summary */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: radius.md,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.line,
            marginBottom: 16,
          }}
        >
          <Row label="Latitude">{latitude.toFixed(6)}</Row>
          <Row label="Longitude">{longitude.toFixed(6)}</Row>
        </View>

        {/* Optional description */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.asphalt, marginBottom: 6 }}>
          Description (optional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!phase}
          placeholder="e.g. Deep pothole near the bus stop"
          placeholderTextColor="#9AA7B2"
          style={{
            minHeight: 90,
            textAlignVertical: "top",
            borderWidth: 1.5,
            borderColor: colors.line,
            borderRadius: radius.md,
            padding: 14,
            fontSize: 16,
            backgroundColor: "#fff",
            color: colors.asphalt,
            marginBottom: 18,
          }}
        />

        <Button
          title={phase ?? (error ? "Retry submission" : "Submit report")}
          onPress={onSubmit}
          loading={!!phase}
        />
        {phase ? (
          <Text style={{ textAlign: "center", color: colors.slate, marginTop: 10 }}>{phase}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
