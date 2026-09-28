import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { Loading } from "../src/components/ui";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Restoring your session" />;
  return <Redirect href={user ? "/(citizen)/home" : "/(auth)/login"} />;
}
