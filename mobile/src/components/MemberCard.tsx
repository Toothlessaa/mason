import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  ChevronRight,
  Clock,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserX,
  type LucideIcon,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { resolveDisplayStatus } from "../lib/memberPortal";
import { colors, fontFamily, radius, shadows, spacing } from "../theme";
import { StatusBadge } from "./StatusBadge";

export type MemberCardProps = {
  name: string;
  role: string;
  status: string;
  memberSince?: string;
  extraLabel?: string;
  fields: Array<{ label: string; value: string }>;
  footer?: ReactNode;
  onPress?: () => void;
};

const FIELD_ICONS: Record<string, LucideIcon> = {
  Email: Mail,
  Phone: Phone,
  Address: MapPin,
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

export function MemberCard({ name, role, status, memberSince, extraLabel, fields, footer, onPress }: MemberCardProps) {
  const displayStatus = resolveDisplayStatus({ role, status });
  const rows = fields.filter((field) => field.value && field.value !== "—");
  const StatusIcon = STATUS_ICONS[displayStatus.toLowerCase()] ?? Info;
  const statusColor = displayStatus.toLowerCase() === "active" ? colors.green : colors.goldSoft;

  return (
    <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={onPress}>
      <LinearGradient
        colors={[colors.gradCardStart, colors.gradCardEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <LinearGradient colors={["#0a1730", "#071024"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initials(name) || "?"}</Text>
            </LinearGradient>
            <View style={[styles.avatarBadge, { borderColor: `${statusColor}55` }]}>
              <StatusIcon size={10} color={statusColor} />
            </View>
          </View>

          <View style={styles.center}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {role}
              {extraLabel ? ` ${extraLabel}` : ""}
            </Text>
            <View style={styles.infoList}>
              {rows.map((field) => {
                const Icon = FIELD_ICONS[field.label] ?? Info;
                return (
                  <View style={styles.infoRow} key={field.label}>
                    <View style={styles.infoIcon}>
                      <Icon size={12.5} color={colors.gold} />
                    </View>
                    <Text style={styles.infoText}>{field.value}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.badges}>
            <StatusBadge status={displayStatus} />
            <View style={styles.lodgeBadge}>
              <Text style={styles.lodgeBadgeText}>Lodge No. 23</Text>
            </View>
          </View>
        </View>

        <View style={styles.sinceBar}>
          <Calendar size={14} color={colors.gold} />
          <Text style={styles.sinceLabel}>Member Since</Text>
          <Text style={styles.sinceValue} numberOfLines={1}>
            {memberSince || "—"}
          </Text>
          {onPress ? <ChevronRight size={16} color={colors.textMuted} /> : null}
        </View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{ translateY: -2 }],
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.card,
  },
  topRow: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 2,
    backgroundColor: colors.cardAlt,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.gold,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  avatarBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    lineHeight: 22,
  },
  role: {
    color: colors.gold,
    fontSize: 13,
    fontFamily: fontFamily.semibold,
    lineHeight: 18,
  },
  infoList: {
    marginTop: 6,
    gap: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoIcon: {
    width: 16,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 12.5,
    lineHeight: 17,
    fontFamily: fontFamily.medium,
  },
  badges: {
    alignItems: "flex-end",
    gap: spacing.sm,
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
  sinceBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(3, 9, 22, 0.55)",
    borderTopWidth: 1,
    borderTopColor: "rgba(217, 224, 237, 0.08)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sinceLabel: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontFamily: fontFamily.medium,
  },
  sinceValue: {
    flex: 1,
    color: colors.gold,
    fontSize: 12.5,
    fontFamily: fontFamily.semibold,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
