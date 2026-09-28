import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function AuthLayout() {
  const { user } = useAuth();
  if (user) return <Redirect href="/(citizen)/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
