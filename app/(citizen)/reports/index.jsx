import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { listReports } from "../../../src/api/reports";
import ReportCard from "../../../src/components/ReportCard";
import { Button, Empty, ErrorBanner, Loading } from "../../../src/components/ui";
import { extractItems } from "../../../src/utils/report";
import { resetDraft } from "../../../src/utils/draft";

const PAGE_SIZE = 20;

export default function Reports() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const busy = useRef(false);

  const load = useCallback(async (nextPage, mode) => {
    if (busy.current) return;
    busy.current = true;
    setError(null);
    if (mode === "more") setLoadingMore(true);
    try {
      const data = await listReports(nextPage, PAGE_SIZE);
      const batch = extractItems(data);
      setItems((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
      setPage(nextPage);
      setHasMore(batch.length >= PAGE_SIZE);
    } catch (e) {
      setError(e.message);
    } finally {
      busy.current = false;
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(1);
    }, [load])
  );

  if (loading) return <Loading label="Loading your reports" />;

  return (
    <FlatList
      data={items}
      keyExtractor={(r) => String(r.id)}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      renderItem={({ item }) => (
        <ReportCard report={item} onPress={() => router.push(`/(citizen)/reports/${item.id}`)} />
      )}
      ListHeaderComponent={<ErrorBanner message={error} onRetry={() => load(1)} />}
      ListEmptyComponent={
        error ? null : (
          <Empty
            title="No reports yet"
            body="Roads you report will show up here with live repair progress."
            action={
              <Button
                title="Report road damage"
                onPress={() => {
                  resetDraft();
                  router.push("/(citizen)/report/capture");
                }}
              />
            }
          />
        )
      }
      ListFooterComponent={loadingMore ? <View style={{ padding: 16 }}><ActivityIndicator /></View> : null}
      onEndReachedThreshold={0.4}
      onEndReached={() => hasMore && !loadingMore && items.length > 0 && load(page + 1, "more")}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1); }} />
      }
    />
  );
}
