import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type DimensionValue } from "react-native";
import { colors, radius, spacing } from "../theme";

export function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const bar = (width: DimensionValue, height: DimensionValue = 11) => ({ ...styles.bar, width, height });

  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={styles.main}>
        <View style={styles.avatar} />
        <View style={styles.lines}>
          <View style={bar("55%", 15)} />
          <View style={bar("38%", 11)} />
          <View style={bar("85%", 11)} />
          <View style={bar("70%", 11)} />
          <View style={bar("62%", 11)} />
        </View>
        <View style={styles.badges}>
          <View style={bar(64, 22)} />
          <View style={bar(84, 22)} />
        </View>
      </View>
      <View style={styles.sinceBar}>
        <View style={styles.sinceIcon} />
        <View style={bar(90, 11)} />
        <View style={bar(70, 11)} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    overflow: "hidden",
  },
  main: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
  },
  lines: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: 2,
  },
  badges: {
    gap: spacing.sm,
    alignItems: "flex-end",
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
  sinceIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.cardAlt,
  },
  bar: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
  },
});
