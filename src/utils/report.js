import { API_ORIGIN } from "../config/api";
import { colors } from "./theme";

// The backend is the source of truth. These helpers only READ and FORMAT fields.

export const STATUS_FLOW = [
  "submitted", "under_review", "assigned", "accepted",
  "in_progress", "repair_completed", "verification", "resolved",
];

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under review",
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "Repair in progress",
  repair_completed: "Repair completed",
  verification: "Being verified",
  resolved: "Resolved",
  rejected_for_rework: "Sent back for rework",
  escalated: "Escalated",
  cancelled: "Cancelled",
};

export function humanize(value) {
  if (!value) return "—";
  const s = String(value).toLowerCase();
  if (STATUS_LABELS[s]) return STATUS_LABELS[s];
  const t = s.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "resolved") return { fg: colors.ok, bg: colors.okBg };
  if (s === "escalated" || s === "rejected_for_rework") return { fg: colors.danger, bg: colors.dangerBg };
  if (s === "cancelled") return { fg: colors.slate, bg: "#E9EDF0" };
  return { fg: "#0B4F8A", bg: "#E3F0FB" };
}

export function severityTone(sev) {
  const s = String(sev || "").toLowerCase();
  if (["critical", "severe", "high"].includes(s)) return { fg: colors.danger, bg: colors.dangerBg };
  if (["medium", "moderate"].includes(s)) return { fg: "#8A5A00", bg: "#FFF3D6" };
  if (["low", "minor"].includes(s)) return { fg: colors.ok, bg: colors.okBg };
  return { fg: colors.slate, bg: "#E9EDF0" };
}

export const isEscalated = (r) =>
  String(r?.status || "").toLowerCase() === "escalated" || r?.is_escalated === true || !!r?.escalated_at;

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return withTime
    ? d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatConfidence(c) {
  if (c === null || c === undefined || c === "") return "—";
  const n = Number(c);
  if (isNaN(n)) return String(c);
  return `${Math.round(n <= 1 ? n * 100 : n)}%`;
}

export function imageUrl(report) {
  const u = report?.image_url || report?.image_path || report?.image;
  if (!u || typeof u !== "string") return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
}

export const reportNumber = (r) => r?.report_number || r?.report_no || (r?.id ? `#${r.id}` : "—");
export const damageType = (r) => r?.damage_type || r?.ai_damage_type || null;
export const confidence = (r) => r?.ai_confidence ?? r?.confidence;
export const locationText = (r) =>
  r?.address ||
  r?.location_address ||
  (r?.latitude != null && r?.longitude != null
    ? `${Number(r.latitude).toFixed(5)}, ${Number(r.longitude).toFixed(5)}`
    : "—");

// Accepts an array or a paginated envelope.
export function extractItems(data) {
  if (Array.isArray(data)) return data;
  return data?.items || data?.results || data?.reports || data?.data || [];
}
