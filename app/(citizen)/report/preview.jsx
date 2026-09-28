import React, { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { submitReport } from "../../../src/api/reports";
import { Button, ErrorBanner, Row } from "../../../src/components/ui";
import { getDraft, setDraft } from "../../../src/utils/draft";
import { colors, radius } from "../../../src/utils/theme";

export default function Preview() {
  const router = useRouter();
  const d = getDraft();
  const [description, setDescription] = useState(d.description || "");
  const [phase, setPhase] = useState(null); // null | "Uploading image" | "Analysing road"
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const onSubmit = async () => {
    if (inFlight.current) return; // block duplicate submissions
    inFlight.current = true;
    setError(null);
    setPhase("Uploading image…");
    setDraft({ description });
    const t = setTimeout(() => setPhase("Analysing road…"), 1800);
    try {
      const result = await submitReport({
        latitude: d.latitude,
        longitude: d.longitude,
        description: description.trim(),
        imageUri: d.imageUri,
      });
      setDraft({ result });
      router.replace("/(citizen)/report/result");
    } catch (e) {
      setError(`${e.message}\n\nYour photo and location are kept — you can retry.`);
    } finally {
      clearTimeout(t);
      setPhase(null);
      inFlight.current = false;
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={error} />
        <Image source={{ uri: d.imageUri }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: "#E4E9ED", marginBottom: 14 }} />
        <View style={{ backgroundColor: "#fff", borderRadius: radius.md, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 16 }}>
          <Row label="Latitude">{d.latitude?.toFixed(6) ?? "—"}</Row>
          <Row label="Longitude">{d.longitude?.toFixed(6) ?? "—"}</Row>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.asphalt, marginBottom: 6 }}>Description (optional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!phase}
          placeholder="e.g. Deep pothole near the bus stop"
          placeholderTextColor="#9AA7B2"
          style={{ minHeight: 90, textAlignVertical: "top", borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: 14, fontSize: 16, backgroundColor: "#fff", color: colors.asphalt, marginBottom: 18 }}
        />
        <Button title={phase || (error ? "Retry submission" : "Submit report")} onPress={onSubmit} loading={!!phase} />
        {phase ? <Text style={{ textAlign: "center", color: colors.slate, marginTop: 10 }}>{phase}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
