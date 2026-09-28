import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Badge } from "./ui";
import { colors, radius } from "../utils/theme";
import { confidence, damageType, formatDate, humanize, reportNumber, severityTone, statusTone } from "../utils/report";

export default function ReportCard({ report, onPress }) {
  const title = damageType(report) ? humanize(damageType(report)) : report.description || "Road damage";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.card, pressed && { opacity: 0.85 }]}>
      <View style={st.top}>
        <Text style={st.num}>{reportNumber(report)}</Text>
        <Text style={st.date}>{formatDate(report.created_at)}</Text>
      </View>
      <Text style={st.title} numberOfLines={1}>{title}</Text>
      {damageType(report) && report.description ? (
        <Text style={st.desc} numberOfLines={2}>{report.description}</Text>
      ) : null}
      <View style={st.badges}>
        <Badge text={humanize(report.status)} tone={statusTone(report.status)} />
        {report.severity ? <Badge text={`Severity: ${humanize(report.severity)}`} tone={severityTone(report.severity)} /> : null}
        {report.priority ? <Badge text={`Priority: ${humanize(report.priority)}`} tone={{ fg: colors.asphalt, bg: "#E9EDF0" }} /> : null}
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: radius.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.line },
  top: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  num: { fontSize: 13, fontWeight: "700", color: colors.slate },
  date: { fontSize: 13, color: colors.slate },
  title: { fontSize: 17, fontWeight: "700", color: colors.asphalt },
  desc: { fontSize: 14, color: colors.slate, marginTop: 4, lineHeight: 20 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
});
