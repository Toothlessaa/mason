import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts, radius, spacing } from "../theme";

type GoldButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
};

export function GoldButton({ title, onPress, disabled, loading, icon }: GoldButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.buttonDim]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {icon}
      <Text style={styles.text}>{loading ? "Please wait..." : title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  buttonDim: {
    opacity: 0.6,
  },
  text: {
    color: "#0a1420",
    fontSize: 15,
    fontWeight: fonts.heading,
  },
});
