import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { resetDraft } from "../../src/utils/draft";
import { colors, radius } from "../../src/utils/theme";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const first = (user?.full_name || "").split(" ")[0];

  const startReport = () => {
    resetDraft();
    router.push("/(citizen)/report/capture");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 15, color: colors.slate }}>Hello{first ? `, ${first}` : ""}</Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.asphalt, marginTop: 2, marginBottom: 22 }}>
          Spotted a damaged road?
        </Text>

        <Pressable
          onPress={startReport}
          style={({ pressed }) => ({
            backgroundColor: colors.marking, borderRadius: radius.md, padding: 24, opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.markingDark }}>Report road damage</Text>
          <Text style={{ fontSize: 14, color: colors.markingDark, marginTop: 6, lineHeight: 20 }}>
            Take a photo, confirm the location and our AI assesses the damage.
          </Text>
        </Pressable>

        <View style={{ marginTop: 16, gap: 12 }}>
          <Tile title="My reports" body="Track progress, repairs and verification" onPress={() => router.push("/(citizen)/reports")} />
          <Tile title="Profile" body="Your account and logout" onPress={() => router.push("/(citizen)/profile")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ title, body, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#fff", borderRadius: radius.md, padding: 18, borderWidth: 1,
        borderColor: colors.line, opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.asphalt }}>{title}</Text>
      <Text style={{ fontSize: 14, color: colors.slate, marginTop: 3 }}>{body}</Text>
    </Pressable>
  );
}
