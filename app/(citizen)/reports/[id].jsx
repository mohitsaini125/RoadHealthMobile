import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getReport } from "../../../src/api/reports";
import Timeline from "../../../src/components/Timeline";
import { Badge, Button, ErrorBanner, Loading, Row } from "../../../src/components/ui";
import { colors, radius } from "../../../src/utils/theme";
import {
  confidence, damageType, formatConfidence, formatDate, humanize, imageUrl,
  isEscalated, locationText, reportNumber, severityTone, statusTone,
} from "../../../src/utils/report";

const Card = ({ title, children }) => (
  <View style={{ backgroundColor: "#fff", borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 14 }}>
    <Text style={{ fontSize: 16, fontWeight: "800", color: colors.asphalt, marginBottom: 8 }}>{title}</Text>
    {children}
  </View>
);

export default function ReportDetails() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await getReport(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label="Loading report" />;
  if (!report) {
    return (
      <View style={{ padding: 20 }}>
        <ErrorBanner message={error || "Report not found."} onRetry={load} />
      </View>
    );
  }

  const img = imageUrl(report);
  const history = report.status_history || report.timeline || report.history;
  const repairEvidence = report.repair_image_url || report.repair_evidence_url || report.repair_image;
  const repairImg = imageUrl({ image_url: repairEvidence });
  const completedAt = report.repair_completed_at || report.completed_at;
  const verification = report.verification_status || report.verification?.status;
  const verifiedAt = report.verified_at || report.verification?.verified_at;
  const verifyNote = report.verification_remarks || report.verification?.remarks;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {isEscalated(report) ? (
        <View style={{ backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#F3B9B4" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.danger }}>⚠ Report escalated</Text>
          <Text style={{ fontSize: 14, color: colors.danger, marginTop: 4, lineHeight: 20 }}>
            This report was not resolved within the expected repair time and has been escalated to the next authority.
          </Text>
        </View>
      ) : null}

      {img ? (
        <Image source={{ uri: img }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: "#E4E9ED", marginBottom: 14 }} resizeMode="cover" />
      ) : null}

      <Card title={reportNumber(report)}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          <Badge text={humanize(report.status)} tone={statusTone(report.status)} />
          {report.severity ? <Badge text={`Severity: ${humanize(report.severity)}`} tone={severityTone(report.severity)} /> : null}
        </View>
        {report.description ? <Text style={{ fontSize: 15, color: colors.asphalt, lineHeight: 22, marginVertical: 8 }}>{report.description}</Text> : null}
        <Row label="Damage type">{humanize(damageType(report))}</Row>
        <Row label="Priority">{humanize(report.priority)}</Row>
        <Row label="AI confidence">{formatConfidence(confidence(report))}</Row>
        <Row label="Location">{locationText(report)}</Row>
        <Row label="Reported">{formatDate(report.created_at, true)}</Row>
        <Row label="Repair deadline">{formatDate(report.repair_deadline || report.sla_deadline || report.due_at)}</Row>
      </Card>

      <Card title="Progress">
        <Timeline status={report.status} history={history} />
      </Card>

      <Card title="Repair & verification">
        <Row label="Repair completed">{completedAt ? formatDate(completedAt, true) : "Not yet"}</Row>
        <Row label="Verification">{verification ? humanize(verification) : "Pending"}</Row>
        {verifiedAt ? <Row label="Verified on">{formatDate(verifiedAt, true)}</Row> : null}
        {verifyNote ? <Text style={{ marginTop: 10, color: colors.slate, lineHeight: 20 }}>{verifyNote}</Text> : null}
        {repairImg ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 13, color: colors.slate, marginBottom: 6 }}>Repair evidence</Text>
            <Image source={{ uri: repairImg }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.sm, backgroundColor: "#E4E9ED" }} resizeMode="cover" />
          </View>
        ) : null}
      </Card>

      <Button title="Refresh status" onPress={load} variant="outline" />
    </ScrollView>
  );
}
