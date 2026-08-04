import { LinearGradient } from "expo-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, radius, shadows, spacing } from "../theme";

export type StatItem = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export function StatsRow({ items }: { items: StatItem[] }) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <LinearGradient
          key={item.label}
          colors={[colors.gradStatStart, colors.gradStatEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconWrap}>
            <item.icon size={16} color={colors.gold} />
          </View>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </LinearGradient>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 104,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.14)",
    gap: 3,
    ...shadows.card,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(226, 196, 122, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: 21,
    fontFamily: fontFamily.extrabold,
    lineHeight: 26,
  },
  label: {
    color: colors.textDim,
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
    lineHeight: 13,
  },
});
