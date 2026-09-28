import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../utils/theme";

export function Button({ title, onPress, loading, disabled, variant = "primary", style }) {
  const off = disabled || loading;
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [s.btn, v.box, off && { opacity: 0.55 }, pressed && { opacity: 0.85 }, style]}
    >
      {loading ? <ActivityIndicator color={v.text.color} /> : <Text style={[s.btnText, v.text]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, error, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#9AA7B2"
        autoCapitalize="none"
        style={[s.input, error && { borderColor: colors.danger }]}
        {...props}
      />
    </View>
  );
}

export function Badge({ text, tone }) {
  return (
    <View style={[s.badge, { backgroundColor: tone.bg }]}>
      <Text style={[s.badgeText, { color: tone.fg }]}>{text}</Text>
    </View>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <View style={s.error}>
      <Text style={{ color: colors.danger, fontSize: 14, lineHeight: 20 }}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={{ marginTop: 8 }}>
          <Text style={{ color: colors.danger, fontWeight: "700" }}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Loading({ label }) {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.asphalt} />
      {label ? <Text style={{ marginTop: 12, color: colors.slate }}>{label}</Text> : null}
    </View>
  );
}

export function Empty({ title, body, action }) {
  return (
    <View style={s.center}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.asphalt, textAlign: "center" }}>{title}</Text>
      {body ? <Text style={{ marginTop: 6, color: colors.slate, textAlign: "center", lineHeight: 20 }}>{body}</Text> : null}
      {action ? <View style={{ marginTop: 18, alignSelf: "stretch" }}>{action}</View> : null}
    </View>
  );
}

export function Row({ label, children }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        {typeof children === "string" ? <Text style={s.rowValue}>{children}</Text> : children}
      </View>
    </View>
  );
}

const variants = {
  primary: { box: { backgroundColor: colors.marking }, text: { color: colors.markingDark } },
  dark: { box: { backgroundColor: colors.asphalt }, text: { color: "#fff" } },
  outline: { box: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.asphalt }, text: { color: colors.asphalt } },
  danger: { box: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.danger }, text: { color: colors.danger } },
};

export const s = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  btnText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: colors.asphalt, marginBottom: 6 },
  input: {
    minHeight: 50, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md,
    paddingHorizontal: 14, fontSize: 16, color: colors.asphalt, backgroundColor: "#fff",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  error: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 12, marginBottom: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { color: colors.slate, fontSize: 14, marginRight: 16 },
  rowValue: { color: colors.asphalt, fontSize: 14, fontWeight: "600", textAlign: "right" },
});
