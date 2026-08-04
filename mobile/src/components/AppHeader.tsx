import { MoreVertical, RefreshCw, LogOut, ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadows, sizes, spacing } from "../theme";
import { Logos } from "./Logos";

type MenuItem = {
  label: string;
  icon: typeof RefreshCw;
  onPress: () => void;
  destructive?: boolean;
};

type AppHeaderProps = {
  onBack: () => void;
  menuItems?: MenuItem[];
  logoSize?: number;
};

export function AppHeader({ onBack, menuItems, logoSize = 34 }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={onBack} accessibilityLabel="Go back">
        <ArrowLeft size={20} color={colors.text} />
      </Pressable>

      <View style={styles.logos}>
        <Logos size={logoSize} />
      </View>

      <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={() => setMenuOpen(true)} accessibilityLabel="More options">
        <MoreVertical size={20} color={colors.text} />
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            {(menuItems ?? []).map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={() => {
                  setMenuOpen(false);
                  item.onPress();
                }}
              >
                <item.icon size={16} color={item.destructive ? colors.redSoft : colors.gold} />
                <Text style={[styles.menuItemText, item.destructive && styles.menuItemTextDestructive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  iconButton: {
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
  logos: {
    flex: 1,
    alignItems: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  menu: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.lg,
    minWidth: 180,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    minHeight: sizes.touch,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  menuItemTextDestructive: {
    color: colors.redSoft,
  },
});
