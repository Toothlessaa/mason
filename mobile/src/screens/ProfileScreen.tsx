import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, BellRing, Calendar, ClipboardCheck, Clock, FileText, Images, Info, LayoutGrid, LogOut, Mail, MapPin, Megaphone, Phone, Presentation, Save, ShieldCheck, UserRound, Users, UserX, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import { BottomNav, type BottomNavItem } from "../components/BottomNav";
import { StatusBadge } from "../components/StatusBadge";
import { getAdminSession, getSession, resolveDisplayStatus, signOut, updateMemberProfile, type MemberProfile } from "../lib/memberPortal";
import { getPushPermissionStatus, registerPushForMember, sendPush } from "../lib/push";
import { colors, fontFamily, radius, shadows, sizes, spacing } from "../theme";

const STATUS_ICONS: Record<string, LucideIcon> = {
  active: ShieldCheck,
  pending: Clock,
  rejected: UserX,
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [authorized, setAuthorized] = useState(false);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [pushPermission, setPushPermission] = useState("");
  const [pushTesting, setPushTesting] = useState(false);

  useEffect(() => {
    (async () => {
      setPushPermission(await getPushPermissionStatus());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const session = (await getSession()) ?? (await getAdminSession());
      if (!session) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }
      setMember(session);
      setPhone(session.phone ?? "");
      setAddress(session.address ?? "");
      setAuthorized(true);
    })();
  }, [navigation]);

  const handleSave = async () => {
    if (!member || saving) return;
    setSaving(true);
    const result = await updateMemberProfile(member.id, { phone, address });
    setSaving(false);
    if (result.error || !result.member) {
      Alert.alert("Unable to save", result.error?.message || "Something went wrong. Please try again.");
      return;
    }
    setMember(result.member);
    Alert.alert("Profile updated", "Your changes have been saved.");
    navigation.goBack();
  };

  const logout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const enablePush = async () => {
    if (!member) return;
    const result = await registerPushForMember(member);
    setPushPermission(result.permission);
    if (result.saved && result.token) {
      Alert.alert("Notifications enabled", "This device is registered to receive lodge pushes.");
    } else {
      Alert.alert("Notifications not enabled", result.error || "Permission was not granted.");
    }
  };

  const testPush = async () => {
    if (!member || pushTesting) return;
    setPushTesting(true);
    const result = await registerPushForMember(member);
    setPushPermission(result.permission);
    if (!result.token || !result.saved) {
      setPushTesting(false);
      Alert.alert("Not registered", result.error || "Allow notifications first.");
      return;
    }
    const ok = await sendPush(result.token, {
      title: "Test Push",
      body: "Mt. Capistrano Masonic Lodge No. 23 — push is working!",
    });
    setPushTesting(false);
    Alert.alert(
      ok ? "Test push sent" : "Test push failed",
      ok ? "Check your notification shade." : "FCM rejected the message. Report this to support."
    );
  };

  const comingSoon = (feature: string) => {
    Alert.alert("Coming soon", `${feature} is on its way.`);
  };

  if (!authorized || !member) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const navItems: BottomNavItem[] = member.is_admin
    ? [
        { key: "approvals", label: "Approvals", icon: ClipboardCheck, onPress: () => navigation.navigate("Admin", { section: "approvals" }) },
        { key: "members", label: "Members", icon: Users, onPress: () => navigation.navigate("Admin", { section: "members" }) },
        { key: "media", label: "Media", icon: Images, onPress: () => navigation.navigate("Admin", { section: "media" }) },
        { key: "slideshow", label: "Slides", icon: Presentation, onPress: () => navigation.navigate("Admin", { section: "slideshow" }) },
        { key: "account", label: "Account", icon: UserRound, onPress: () => undefined },
      ]
    : [
        { key: "directory", label: "Directory", icon: LayoutGrid, onPress: () => navigation.reset({ index: 0, routes: [{ name: "Members" }] }) },
        { key: "members", label: "Members", icon: Users, onPress: () => comingSoon("Members") },
        { key: "documents", label: "Documents", icon: FileText, onPress: () => comingSoon("Documents") },
        { key: "announcements", label: "Announcements", icon: Megaphone, onPress: () => comingSoon("Announcements") },
        { key: "account", label: "Account", icon: UserRound, onPress: () => undefined },
      ];

  const displayStatus = resolveDisplayStatus(member);
  const StatusIcon = STATUS_ICONS[displayStatus.toLowerCase()] ?? Info;
  const statusColor = displayStatus.toLowerCase() === "active" ? colors.green : colors.goldSoft;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.topBar}>
          <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
          <View style={styles.topTitles}>
            <Text style={styles.topTitle}>My Profile</Text>
            <Text style={styles.topSubtitle}>Edit your member information</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: sizes.navHeight + insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <LinearGradient colors={["#0a1730", "#071024"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials(member.name) || "?"}</Text>
              </LinearGradient>
              <View style={[styles.avatarBadge, { borderColor: `${statusColor}55` }]}>
                <StatusIcon size={14} color={statusColor} />
              </View>
            </View>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.role}>{member.role}</Text>
            <View style={styles.badgeRow}>
              <StatusBadge status={displayStatus} />
              <View style={styles.lodgeBadge}>
                <Text style={styles.lodgeBadgeText}>Lodge No. 23</Text>
              </View>
            </View>
          </View>

          <LinearGradient colors={[colors.gradCardStart, colors.gradCardEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <Text style={styles.sectionLabel}>Account</Text>
            <View style={styles.readOnlyRow}>
              <Mail size={15} color={colors.gold} />
              <Text style={styles.readOnlyText}>{member.email}</Text>
            </View>
            <View style={styles.readOnlyRow}>
              <Calendar size={15} color={colors.gold} />
              <Text style={styles.readOnlyText}>{member.member_since || "—"}</Text>
            </View>

            <Text style={styles.sectionLabel}>Edit Details</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <View style={styles.inputRow}>
                <Phone size={15} color={colors.gold} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address</Text>
              <View style={styles.inputRow}>
                <MapPin size={15} color={colors.gold} />
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                />
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#0a1420" />
              ) : (
                <>
                  <Save size={17} color="#0a1420" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </Pressable>
          </LinearGradient>

          <LinearGradient colors={[colors.gradCardStart, colors.gradCardEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <Text style={styles.sectionLabel}>Notifications</Text>
            <View style={styles.readOnlyRow}>
              <BellRing size={15} color={colors.gold} />
              <Text style={styles.readOnlyText}>
                Permission: {pushPermission === "granted" ? "Allowed" : pushPermission === "denied" ? "Denied — allow in phone Settings" : "Not asked yet"}
              </Text>
            </View>
            <View style={styles.readOnlyRow}>
              <ShieldCheck size={15} color={colors.gold} />
              <Text style={styles.readOnlyText}>{member.push_token ? "This device is registered" : "No device token saved for this account"}</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]} onPress={enablePush}>
              <BellRing size={17} color="#0a1420" />
              <Text style={styles.saveButtonText}>Enable Notifications</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed, pushTesting && styles.saveButtonDisabled]} onPress={testPush} disabled={pushTesting}>
              {pushTesting ? (
                <ActivityIndicator color={colors.gold} />
              ) : (
                <>
                  <BellRing size={17} color={colors.gold} />
                  <Text style={styles.outlineButtonText}>Send Test Push to This Device</Text>
                </>
              )}
            </Pressable>
          </LinearGradient>

          <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]} onPress={logout}>
            <LogOut size={16} color={colors.redSoft} />
            <Text style={styles.logoutButtonText}>Log out</Text>
          </Pressable>
        </ScrollView>

        <BottomNav active="account" items={navItems} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: spacing.xxl + 12,
    height: spacing.xxl + 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitles: {
    flex: 1,
    gap: 2,
  },
  topTitle: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fontFamily.extrabold,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    lineHeight: 18,
  },
  topSubtitle: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 2,
    backgroundColor: colors.cardAlt,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.gold,
    fontSize: 32,
    fontFamily: fontFamily.bold,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fontFamily.extrabold,
    textAlign: "center",
  },
  role: {
    color: colors.gold,
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  lodgeBadge: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lodgeBadgeText: {
    color: colors.gold,
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 2,
  },
  readOnlyText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 13.5,
    fontFamily: fontFamily.medium,
    lineHeight: 19,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fontFamily.semibold,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.18)",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    minHeight: 50,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    minHeight: 52,
    marginTop: spacing.sm,
    ...shadows.gold,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#0a1420",
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: radius.lg,
    minHeight: 50,
  },
  outlineButtonText: {
    color: colors.gold,
    fontSize: 14,
    fontFamily: fontFamily.semibold,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(239, 63, 69, 0.4)",
    borderRadius: radius.lg,
    minHeight: 50,
  },
  logoutButtonText: {
    color: colors.redSoft,
    fontSize: 14,
    fontFamily: fontFamily.semibold,
  },
});
