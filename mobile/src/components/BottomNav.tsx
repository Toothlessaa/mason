import { LinearGradient } from "expo-linear-gradient";
import { type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily, radius, shadows, sizes, spacing } from "../theme";

export type BottomNavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

type BottomNavProps = {
  active: string;
  items: BottomNavItem[];
};

const RISE = -24;
const CIRCLE_SIZE = 44;

export function BottomNav({ active, items }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.positioner, { paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <LinearGradient
        colors={[colors.gradNavStart, colors.gradNavEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.nav}
      >
        {items.map((item) => (
          <NavItem key={item.key} item={item} active={active === item.key} />
        ))}
      </LinearGradient>
    </View>
  );
}

function NavItem({ item, active }: { item: BottomNavItem; active: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduceMotion(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(active ? 1 : 0);
      return;
    }
    const spring = Animated.spring(progress, {
      toValue: active ? 1 : 0,
      stiffness: 180,
      damping: 20,
      mass: 1,
      useNativeDriver: true,
    });
    if (mounted.current) {
      spring.start();
      return;
    }
    mounted.current = true;
    Animated.sequence([Animated.delay(80), spring]).start();
  }, [active, progress, reduceMotion]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, RISE], extrapolate: "clamp" });
  const circleOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: "clamp" });
  const circleScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1], extrapolate: "clamp" });
  const iconScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14], extrapolate: "clamp" });
  const inactiveOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0], extrapolate: "clamp" });

  const Icon = item.icon;

  return (
    <Pressable
      style={styles.item}
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
    >
      <View style={styles.itemContent}>
        <Animated.View style={[styles.iconStage, { transform: [{ translateY }] }]}>
          <Animated.View style={[styles.circleOuter, { opacity: circleOpacity }]}>
            <Animated.View style={[styles.circleFill, { transform: [{ scale: circleScale }] }]} />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Icon size={21} color={active ? colors.gold : colors.textMuted} />
          </Animated.View>
        </Animated.View>

        <View style={styles.labelStage}>
          <Animated.Text style={[styles.label, styles.labelInactive, { opacity: inactiveOpacity }]} numberOfLines={1}>
            {item.label}
          </Animated.Text>
          <Animated.Text style={[styles.label, styles.labelActive, { opacity: progress }]} numberOfLines={1}>
            {item.label}
          </Animated.Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  positioner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  nav: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    maxWidth: sizes.contentMaxWidth - spacing.lg * 2,
    height: sizes.navHeight,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xxl,
    paddingTop: 34,
    paddingBottom: 6,
    overflow: "visible",
    ...shadows.card,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: sizes.touch,
  },
  itemContent: {
    alignItems: "center",
    gap: spacing.xs,
    height: CIRCLE_SIZE + spacing.xs + 16,
  },
  iconStage: {
    width: CIRCLE_SIZE + 10,
    height: CIRCLE_SIZE + 10,
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: (CIRCLE_SIZE + 10) / 2,
    backgroundColor: "#0d1f3c",
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    shadowColor: colors.goldGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  circleFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: (CIRCLE_SIZE + 10) / 2,
    backgroundColor: "#0d1f3c",
  },
  labelStage: {
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    fontSize: 10,
    fontFamily: fontFamily.semibold,
    textAlign: "center",
  },
  labelInactive: {
    color: colors.textMuted,
    left: 0,
    right: 0,
  },
  labelActive: {
    color: colors.goldLight,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.2,
    left: 0,
    right: 0,
  },
});