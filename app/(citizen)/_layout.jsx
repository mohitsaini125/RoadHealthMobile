import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/utils/theme";

export default function CitizenLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.asphalt,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="report/capture" options={{ title: "Take a photo" }} />
      <Stack.Screen name="report/location" options={{ title: "Location" }} />
      <Stack.Screen name="report/preview" options={{ title: "Review report" }} />
      <Stack.Screen name="report/result" options={{ title: "AI assessment", headerBackVisible: false }} />
      <Stack.Screen name="reports/index" options={{ title: "My reports" }} />
      <Stack.Screen name="reports/[id]" options={{ title: "Report details" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
