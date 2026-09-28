import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Badge, Button, Row } from "../../../src/components/ui";
import { getDraft, resetDraft } from "../../../src/utils/draft";
import { colors, radius } from "../../../src/utils/theme";
import {
  confidence, damageType, formatConfidence, formatDate, humanize,
  locationText, reportNumber, severityTone, statusTone,
} from "../../../src/utils/report";

export default function Result() {
  const router = useRouter();
  const r = getDraft().result || {};

  const goDetails = () => {
    const id = r.id;
    resetDraft();
    router.replace(id ? `/(citizen)/reports/${id}` : "/(citizen)/reports");
  };
  const goHome = () => {
    resetDraft();
    router.replace("/(citizen)/home");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ backgroundColor: colors.asphalt, borderRadius: radius.md, padding: 20, marginBottom: 16 }}>
        <Text style={{ color: "#B8C4CE", fontSize: 13 }}>Report submitted</Text>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 }}>{reportNumber(r)}</Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: radius.md, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 20 }}>
        <Row label="Damage type">{humanize(damageType(r))}</Row>
        <Row label="Severity">
          {r.severity ? <Badge text={humanize(r.severity)} tone={severityTone(r.severity)} /> : "—"}
        </Row>
        <Row label="Priority">{humanize(r.priority)}</Row>
        <Row label="AI confidence">{formatConfidence(confidence(r))}</Row>
        <Row label="Location">{locationText(r)}</Row>
        <Row label="Status">
          <Badge text={humanize(r.status)} tone={statusTone(r.status)} />
        </Row>
        <Row label="Repair deadline">{formatDate(r.repair_deadline || r.sla_deadline || r.due_at)}</Row>
      </View>

      <Button title="Track this report" onPress={goDetails} style={{ marginBottom: 10 }} />
      <Button title="Back to home" onPress={goHome} variant="outline" />
    </ScrollView>
  );
}
