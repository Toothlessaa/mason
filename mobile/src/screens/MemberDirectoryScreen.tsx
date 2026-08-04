import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { FileText, Hash, LayoutGrid, Megaphone, SearchX, UserCheck, UserRound, Users } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, FlatList, Platform, RefreshControl, StyleSheet, Text, View, type ListRenderItem } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import { BottomNav, type BottomNavItem } from "../components/BottomNav";
import { DirectoryFilters } from "../components/DirectoryFilters";
import { Glow } from "../components/Glow";
import { MemberCard } from "../components/MemberCard";
import { MembersHeader } from "../components/MembersHeader";
import { SkeletonCard } from "../components/SkeletonCard";
import { StatsRow } from "../components/StatsRow";
import { getMembers, getSession, signOut, type MemberProfile } from "../lib/memberPortal";
import { colors, fontFamily, sizes, spacing } from "../theme";

const FILTER_KEY = "filters";
const EMPTY_KEY = "empty";

type ListItem =
  | { key: typeof FILTER_KEY; type: "filters" }
  | { key: string; type: "member"; member: MemberProfile }
  | { key: string; type: "skeleton" }
  | { key: typeof EMPTY_KEY; type: "empty" };

export function MemberDirectoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = "::-webkit-scrollbar{display:none}*{scrollbar-width:none}";
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const loadMembers = useCallback(async () => {
    const { data } = await getMembers(["Active", "Honorary"]);
    if (data) setMembers(data);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const session = await getSession();
      if (!session) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }
      setAuthorized(true);
      await loadMembers();
      setLoading(false);
    })();
  }, [navigation, loadMembers]);

  useEffect(() => {
    if (!loading && authorized) {
      fade.setValue(0);
      rise.setValue(10);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [loading, authorized, fade, rise]);

  const logout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  }, [loadMembers]);

  const comingSoon = (label: string) => {
    Alert.alert("Coming soon", `The ${label} section is not available yet.`);
  };

  const categories = useMemo(() => {
    const roles = new Set(members.map((member) => member.role).filter(Boolean));
    return ["All", ...[...roles].sort((a, b) => a.localeCompare(b))];
  }, [members]);

  const visibleMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter((member) => {
      if (activeCategory !== "All" && member.role !== activeCategory) return false;
      if (!needle) return true;
      return [member.name, member.role, member.email, member.phone, member.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [members, query, activeCategory]);

  const data = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [{ key: FILTER_KEY, type: "filters" }];
    if (loading && members.length === 0) {
      for (let i = 0; i < 4; i += 1) items.push({ key: `skeleton-${i}`, type: "skeleton" });
    } else if (visibleMembers.length === 0) {
      items.push({ key: EMPTY_KEY, type: "empty" });
    } else {
      items.push(...visibleMembers.map((member) => ({ key: member.id, type: "member" as const, member })));
    }
    return items;
  }, [loading, members.length, visibleMembers]);

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    if (item.type === "filters") {
      return (
        <View style={styles.stickyFilters}>
          <DirectoryFilters
            query={query}
            onQueryChange={setQuery}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </View>
      );
    }
    if (item.type === "empty") {
      return (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <SearchX size={28} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No members found</Text>
          <Text style={styles.emptyHint}>Try changing your search or filter.</Text>
        </View>
      );
    }
    if (item.type === "skeleton") {
      return <SkeletonCard />;
    }
    return (
      <MemberCard
        name={item.member.name}
        role={item.member.role}
        status={item.member.status}
        memberSince={item.member.member_since || undefined}
        onPress={() => navigation.navigate("MemberDetail", { member: item.member })}
        fields={[
          { label: "Email", value: item.member.email },
          { label: "Phone", value: item.member.phone || "—" },
          { label: "Address", value: item.member.address || "—" },
        ]}
      />
    );
  };

  if (!authorized) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeCount = members.filter((member) => member.status === "Active").length;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradScreenTop, colors.bgTop, colors.gradScreenBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Glow style={styles.glowStats} size={300} tint={colors.goldFaint} />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <MembersHeader title="Members Directory" subtitle="Verified lodge member profiles" onLogout={logout} />

        <Animated.View style={[styles.listWrap, { opacity: fade, transform: [{ translateY: rise }] }]}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            stickyHeaderIndices={[1]}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={[styles.listContent, { paddingBottom: sizes.navHeight + insets.bottom + 32 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} />}
            ListHeaderComponent={
              <View style={styles.heading}>
                <StatsRow
                  items={[
                    { icon: Users, value: String(members.length), label: "Total Members" },
                    { icon: UserCheck, value: String(activeCount), label: "Active" },
                    { icon: Hash, value: "23", label: "Lodge No." },
                  ]}
                />
              </View>
            }
          />
        </Animated.View>

        <BottomNav
          active="directory"
          items={[
            { key: "directory", label: "Directory", icon: LayoutGrid, onPress: () => undefined },
            { key: "members", label: "Members", icon: Users, onPress: () => comingSoon("Members") },
            { key: "documents", label: "Documents", icon: FileText, onPress: () => comingSoon("Documents") },
            { key: "announcements", label: "Announcements", icon: Megaphone, onPress: () => comingSoon("Announcements") },
            { key: "account", label: "Account", icon: UserRound, onPress: () => navigation.navigate("Profile") },
          ]}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  safe: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textDim,
    fontSize: 14,
    fontFamily: fontFamily.medium,
  },
  glowStats: {
    top: 120,
    alignSelf: "center",
    opacity: 0.5,
  },
  listWrap: {
    flex: 1,
  },
  list: {
    width: "100%",
    maxWidth: sizes.contentMaxWidth,
    alignSelf: "center",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stickyFilters: {
    backgroundColor: colors.bgTop,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  empty: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xxl + spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
});
