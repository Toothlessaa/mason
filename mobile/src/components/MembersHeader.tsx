import { LogOut } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, spacing } from "../theme";
import { Logos } from "./Logos";

type MembersHeaderProps = {
  title: string;
  subtitle: string;
  onLogout: () => void;
};

export function MembersHeader({ title, subtitle, onLogout }: MembersHeaderProps) {
  return (
    <View>
      <View style={styles.wrap}>
        <View style={styles.brand}>
          <Logos size={26} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.logout, pressed && styles.pressed]} onPress={onLogout} accessibilityLabel="Log out">
          <LogOut size={17} color={colors.gold} />
        </Pressable>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <View style={styles.diamond} />
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  brand: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  titles: {
    flex: 1,
    gap: 3,
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fontFamily.extrabold,
    letterSpacing: 2,
    textTransform: "uppercase",
    lineHeight: 18,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    lineHeight: 16,
  },
  logout: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  diamond: {
    width: 7,
    height: 7,
    backgroundColor: colors.gold,
    transform: [{ rotate: "45deg" }],
  },
});
