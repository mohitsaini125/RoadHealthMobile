import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { Button, ErrorBanner, Field } from "../../src/components/ui";
import { colors } from "../../src/utils/theme";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    if (busy) return;
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <View style={{ height: 6, width: 56, backgroundColor: colors.marking, borderRadius: 3, marginBottom: 18 }} />
          <Text style={{ fontSize: 30, fontWeight: "800", color: colors.asphalt }}>Road Health AI</Text>
          <Text style={{ fontSize: 16, color: colors.slate, marginTop: 6, marginBottom: 28 }}>
            Log in to report and track damaged roads.
          </Text>
          <ErrorBanner message={error} />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" />
          <Button title="Log in" onPress={onSubmit} loading={busy} style={{ marginTop: 6 }} />
          <Link href="/(auth)/signup" asChild>
            <Pressable style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ color: colors.asphalt, fontSize: 15 }}>
                New here? <Text style={{ fontWeight: "800" }}>Create an account</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
