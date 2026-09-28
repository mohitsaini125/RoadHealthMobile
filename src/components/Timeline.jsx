import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../utils/theme";
import { STATUS_FLOW, formatDate, humanize } from "../utils/report";

// Renders the backend's status history when provided; otherwise shows the standard
// flow with the current status highlighted. It never changes or infers status.
export default function Timeline({ status, history }) {
  const current = String(status || "").toLowerCase();
  const hist = (Array.isArray(history) ? history : []).map((h) => ({
    status: String(h.status || h.to_status || "").toLowerCase(),
    at: h.created_at || h.changed_at || h.timestamp,
    note: h.note || h.remarks || h.comment,
  }));

  let steps;
  if (hist.length) {
    steps = hist.map((h, i) => ({ ...h, done: true, active: i === hist.length - 1 }));
  } else {
    const idx = STATUS_FLOW.indexOf(current);
    steps = STATUS_FLOW.map((k, i) => ({ status: k, done: idx >= 0 && i <= idx, active: i === idx }));
    if (idx < 0 && current) steps.push({ status: current, done: true, active: true });
  }

  return (
    <View>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const abnormal = ["escalated", "rejected_for_rework", "cancelled"].includes(step.status);
        const dot = abnormal ? colors.danger : step.done ? colors.asphalt : colors.line;
        return (
          <View key={`${step.status}-${i}`} style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "center", width: 24 }}>
              <View style={[t.dot, { backgroundColor: dot }, step.active && t.dotActive]} />
              {!last && <View style={[t.rail, { backgroundColor: step.done ? colors.asphalt : colors.line }]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: 18, paddingLeft: 8 }}>
              <Text style={[t.label, !step.done && { color: "#9AA7B2" }, step.active && { fontWeight: "800" }]}>
                {humanize(step.status)}
              </Text>
              {step.at ? <Text style={t.meta}>{formatDate(step.at, true)}</Text> : null}
              {step.note ? <Text style={t.meta}>{step.note}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const t = StyleSheet.create({
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 3 },
  dotActive: { borderWidth: 3, borderColor: colors.marking },
  rail: { width: 2, flex: 1, marginTop: 2 },
  label: { fontSize: 15, color: colors.asphalt, fontWeight: "600" },
  meta: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
