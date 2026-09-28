import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { Button, ErrorBanner, Field } from "../../src/components/ui";
import { colors } from "../../src/utils/theme";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    if (busy) return;
    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      return setError("Name, email and password are required.");
    }
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    setError(null);
    try {
      // No role is sent: public registrations are always citizens (backend-enforced).
      await signup({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.asphalt }}>Create your account</Text>
          <Text style={{ fontSize: 15, color: colors.slate, marginTop: 6, marginBottom: 24 }}>
            Your details help authorities follow up on your reports.
          </Text>
          <ErrorBanner message={error} />
          <Field label="Full name" value={form.full_name} onChangeText={set("full_name")} autoCapitalize="words" placeholder="Rahul Kumar" />
          <Field label="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          <Field label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="9876543210" />
          <Field label="Password" value={form.password} onChangeText={set("password")} secureTextEntry placeholder="At least 8 characters" />
          <Button title="Sign up" onPress={onSubmit} loading={busy} style={{ marginTop: 6 }} />
          <Link href="/(auth)/login" asChild>
            <Pressable style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ color: colors.asphalt, fontSize: 15 }}>
                Already registered? <Text style={{ fontWeight: "800" }}>Log in</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
