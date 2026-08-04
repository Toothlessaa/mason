import { TextInput, StyleSheet, Text, View, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "../theme";

type FieldProps = TextInputProps & {
  label: string;
};

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textDim}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.22)",
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
});
