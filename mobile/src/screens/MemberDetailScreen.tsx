import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Calendar, Clock, Info, Mail, MapPin, Phone, ShieldCheck, UserX, type LucideIcon } from "lucide-react-native";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import { StatusBadge } from "../components/StatusBadge";
import { resolveDisplayStatus } from "../lib/memberPortal";
import { colors, fontFamily, radius, shadows, spacing } from "../theme";

type DetailRoute = RouteProp<RootStackParamList, "MemberDetail">;

const FIELD_ICONS: Record<string, LucideIcon> = {
  Email: Mail,
  Phone: Phone,
  Address: MapPin,
  "Member Since": Calendar,
  "Freemason Info": ShieldCheck,
};

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

export function MemberDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<DetailRoute>();
  const member = params.member;

  const callMember = () => {
    if (!member.phone) return;
    Linking.openURL(`tel:${member.phone.replace(/[^\d+]/g, "")}`).catch(() => {
      Alert.alert("Unable to call", "Could not open the phone dialer.");
    });
  };

  const emailMember = () => {
    if (!member.email) return;
    Linking.openURL(`mailto:${member.email}`).catch(() => {
      Alert.alert("Unable to email", "Could not open your email app.");
    });
  };

  const fields = [
    { label: "Email", value: member.email },
    { label: "Phone", value: member.phone || "—" },
    { label: "Address", value: member.address || "—" },
    { label: "Member Since", value: member.member_since || "—" },
    { label: "Freemason Info", value: member.is_freemason || "—" },
  ].filter((field) => field.value && field.value !== "—");

  const displayStatus = resolveDisplayStatus({ role: member.role, status: member.status });
  const StatusIcon = STATUS_ICONS[displayStatus.toLowerCase()] ?? Info;
  const statusColor = displayStatus.toLowerCase() === "active" ? colors.green : colors.goldSoft;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <LinearGradient
              colors={["#0a1730", "#071024"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarInner}
            >
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

        <View style={styles.contactRow}>
          <Pressable style={({ pressed }) => [styles.contactButton, !member.phone && styles.contactButtonDisabled, pressed && styles.pressed]} onPress={callMember} disabled={!member.phone}>
            <Phone size={17} color="#0a1420" />
            <Text style={styles.contactButtonText}>Call</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.contactButton, !member.email && styles.contactButtonDisabled, pressed && styles.pressed]} onPress={emailMember} disabled={!member.email}>
            <Mail size={17} color="#0a1420" />
            <Text style={styles.contactButtonText}>Email</Text>
          </Pressable>
        </View>

        {fields.length ? (
          <LinearGradient
            colors={[colors.gradCardStart, colors.gradCardEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardHeading}>
              <ShieldCheck size={17} color={colors.gold} />
              <Text style={styles.cardHeadingText}>Member Profile Information</Text>
            </View>
            <View style={styles.fields}>
              {fields.map((field) => {
                const Icon = FIELD_ICONS[field.label] ?? Info;
                return (
                  <View style={styles.field} key={field.label}>
                    <View style={styles.fieldIcon}>
                      <Icon size={14} color={colors.gold} />
                    </View>
                    <View style={styles.fieldBody}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <Text style={styles.fieldValue}>{field.value}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: spacing.xxl + 12,
    height: spacing.xxl + 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
    alignItems: "stretch",
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 2,
    backgroundColor: colors.cardAlt,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 43,
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
    fontSize: 34,
    fontFamily: fontFamily.bold,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontFamily: fontFamily.extrabold,
    textAlign: "center",
  },
  role: {
    color: colors.gold,
    fontSize: 15,
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
  contactRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: 13,
    minHeight: 48,
    borderRadius: radius.lg,
    ...shadows.gold,
  },
  contactButtonDisabled: {
    opacity: 0.4,
    ...shadows.soft,
  },
  contactButtonText: {
    color: "#0a1420",
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardHeadingText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fontFamily.semibold,
  },
  fields: {
    gap: spacing.md,
  },
  field: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(226, 196, 122, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldBody: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  fieldValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
  },
});
