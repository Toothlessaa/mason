import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../theme";

type GlowProps = {
  size?: number;
  tint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Glow({ size = 280, tint = colors.goldFaint, style }: GlowProps) {
  return (
    <View style={[styles.glow, { width: size, height: size }, style]} pointerEvents="none">
      <View style={[styles.layer, styles.outer, { backgroundColor: tint, width: size, height: size }]} />
      <View style={[styles.layer, { backgroundColor: "rgba(226, 196, 122, 0.05)", width: size * 0.66, height: size * 0.66 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  layer: {
    position: "absolute",
    borderRadius: 999,
  },
  outer: {
    opacity: 0.6,
  },
});
