import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { getMe } from "../../src/api/auth";
import { useAuth } from "../../src/context/AuthContext";
import { Button, ErrorBanner, Loading, Row } from "../../src/components/ui";
import { humanize } from "../../src/utils/report";
import { colors, radius } from "../../src/utils/theme";

export default function Profile() {
  const { user: cached, logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setUser(await getMe());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onLogout = async () => {
    await logout(); // deletes token + clears client state
    router.replace("/(auth)/login");
  };

  if (loading) return <Loading />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <ErrorBanner message={error} onRetry={load} />
      {user ? (
        <View style={{ backgroundColor: "#fff", borderRadius: radius.md, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 24 }}>
          <Row label="Name">{user.full_name || "—"}</Row>
          <Row label="Email">{user.email || "—"}</Row>
          <Row label="Phone">{user.phone || "—"}</Row>
          <Row label="Role">{humanize(user.role)}</Row>
        </View>
      ) : null}
      <Button title="Log out" onPress={onLogout} variant="danger" />
    </ScrollView>
  );
}
