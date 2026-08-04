import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClipboardCheck, Images, LogOut, Presentation, RefreshCw, UserCheck, Users, UserRound, Clock } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import { AppHeader } from "../components/AppHeader";
import { BottomNav, type BottomNavItem } from "../components/BottomNav";
import { DirectoryFilters } from "../components/DirectoryFilters";
import { MediaPanel } from "../components/MediaPanel";
import { MemberCard } from "../components/MemberCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { SlideshowPanel } from "../components/SlideshowPanel";
import { StatsRow } from "../components/StatsRow";
import { getAllMembers, getAdminSession, signOut, updateMemberStatus, type MemberProfile } from "../lib/memberPortal";
import { sendPush } from "../lib/push";
import { colors, fonts, radius, sizes, spacing } from "../theme";

export type Section = "approvals" | "members" | "media" | "slideshow";

const SECTION_LABELS: Record<Section, { title: string; intro: string }> = {
  approvals: {
    title: "Approvals",
    intro: "Review pending applications before they enter the member database.",
  },
  members: {
    title: "Members",
    intro: "View all member records from the database.",
  },
  media: {
    title: "Media",
    intro: "Upload and publish media for the public website.",
  },
  slideshow: {
    title: "Slideshow",
    intro: "Upload moving pictures shown between The Three Lights and Media.",
  },
};

export function AdminPanelScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Admin">>();
  const insets = useSafeAreaInsets();
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("approvals");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const sectionParam = route.params?.section;

  useEffect(() => {
    if (sectionParam) setActiveSection(sectionParam);
  }, [sectionParam]);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const { data } = await getAllMembers();
    if (data) setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const session = await getAdminSession();
      if (!session) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }
      setAuthorized(true);
      setSessionName(session.name);
      loadMembers();
    })();
  }, [navigation, loadMembers]);

  const logout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  const handleApprove = async (memberId: string) => {
    const target = members.find((member) => member.id === memberId);
    const { data } = await updateMemberStatus(memberId, "Active");
    if (data && target?.push_token) {
      await sendPush(target.push_token, {
        title: "Membership Approved",
        body: `Welcome to Mt. Capistrano Masonic Lodge No. 23, ${target.name.split(" ")[0]}. Your application has been approved.`,
      });
    }
    await loadMembers();
  };

  const handleReject = async (memberId: string) => {
    await updateMemberStatus(memberId, "Rejected");
    await loadMembers();
  };

  const categories = useMemo(() => {
    const roles = new Set(members.map((member) => member.role).filter(Boolean));
    return ["All", ...[...roles].sort((a, b) => a.localeCompare(b))];
  }, [members]);

  const searchableMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter((member) => {
      if (activeCategory !== "All" && member.role !== activeCategory) return false;
      if (!needle) return true;
      return [member.name, member.role, member.email, member.phone, member.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [members, query, activeCategory]);

  if (!authorized) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const pendingCount = members.filter((m) => m.status === "Pending").length;
  const activeCount = members.filter((m) => m.status === "Active").length;
  const isMemberSection = activeSection === "approvals" || activeSection === "members";
  const pendingMembers = members.filter((member) => member.status === "Pending");
  const section = SECTION_LABELS[activeSection];

  const visibleMembers = activeSection === "approvals" ? pendingMembers : searchableMembers;

  const navItems: BottomNavItem[] = [
    { key: "approvals", label: "Approvals", icon: ClipboardCheck, onPress: () => setActiveSection("approvals") },
    { key: "members", label: "Members", icon: Users, onPress: () => setActiveSection("members") },
    { key: "media", label: "Media", icon: Images, onPress: () => setActiveSection("media") },
    { key: "slideshow", label: "Slides", icon: Presentation, onPress: () => setActiveSection("slideshow") },
    { key: "account", label: "Account", icon: UserRound, onPress: () => navigation.navigate("Profile") },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <AppHeader
        onBack={() => navigation.navigate("Home")}
        menuItems={[
          { label: "Refresh", icon: RefreshCw, onPress: loadMembers },
          { label: "Logout", icon: LogOut, onPress: logout, destructive: true },
        ]}
      />

      <View style={styles.heading}>
        <Text style={styles.title}>{section.title}</Text>
        <Text style={styles.subtitle}>
          Welcome, {sessionName}. {section.intro}
        </Text>
      </View>

      {isMemberSection ? (
        <View style={styles.memberContent}>
          <View style={styles.stats}>
            <StatsRow
              items={[
                { icon: Users, value: String(members.length), label: "Total" },
                { icon: Clock, value: String(pendingCount), label: "Pending" },
                { icon: UserCheck, value: String(activeCount), label: "Active" },
              ]}
            />
          </View>

          {activeSection === "members" ? (
            <View style={styles.filters}>
              <DirectoryFilters
                query={query}
                onQueryChange={setQuery}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </View>
          ) : null}

          <FlatList
            data={visibleMembers}
            keyExtractor={(member) => member.id}
            contentContainerStyle={[styles.list, { paddingBottom: sizes.navHeight + insets.bottom + 40 }]}
            keyboardShouldPersistTaps="handled"
            style={styles.listStyle}
            ListEmptyComponent={
              <View style={styles.empty}>
                {loading ? (
                  <View style={styles.skeletons}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </View>
                ) : (
                  <>
                    <Text style={styles.emptyTitle}>
                      {activeSection === "approvals" ? "No pending approvals" : "No members found"}
                    </Text>
                    <Text style={styles.emptyHint}>
                      {activeSection === "approvals" ? "New applications will appear here." : "Try a different search or filter."}
                    </Text>
                  </>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <MemberCard
                name={item.name}
                role={item.role}
                status={item.status}
                extraLabel={item.is_admin ? "(Admin)" : undefined}
                onPress={() => navigation.navigate("MemberDetail", { member: item })}
                fields={[
                  { label: "Email", value: item.email },
                  { label: "Phone", value: item.phone || "—" },
                  { label: "Address", value: item.address || "—" },
                  { label: "Freemason Info", value: item.is_freemason || "—" },
                ]}
                footer={
                  item.status === "Pending" ? (
                    <>
                      <Pressable style={({ pressed }) => [styles.confirmButton, styles.buttonBase, pressed && styles.pressed]} onPress={() => handleApprove(item.id)}>
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                      </Pressable>
                      <Pressable style={({ pressed }) => [styles.rejectButton, styles.buttonBase, pressed && styles.pressed]} onPress={() => handleReject(item.id)}>
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </Pressable>
                    </>
                  ) : null
                }
              />
            )}
          />
        </View>
      ) : activeSection === "media" ? (
        <MediaPanel adminName={sessionName} />
      ) : (
        <SlideshowPanel adminName={sessionName} />
      )}

      <BottomNav active={activeSection} items={navItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTop,
  },
  heading: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  memberContent: {
    flex: 1,
  },
  stats: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listStyle: {
    width: "100%",
    maxWidth: sizes.contentMaxWidth,
    alignSelf: "center",
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  empty: {
    paddingTop: spacing.xl,
  },
  skeletons: {
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: fonts.semibold,
    textAlign: "center",
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  buttonBase: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  confirmButton: {
    backgroundColor: "rgba(46, 204, 113, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.45)",
  },
  confirmButtonText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700",
  },
  rejectButton: {
    backgroundColor: "rgba(220, 20, 60, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(220, 20, 60, 0.45)",
  },
  rejectButtonText: {
    color: colors.redSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
});
