import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "../theme";

const STATUS_STYLES: Record<string, { color: string; background: string; border: string }> = {
  active: { color: colors.green, background: "rgba(46, 204, 113, 0.14)", border: "rgba(46, 204, 113, 0.35)" },
  honorary: { color: colors.blueSoft, background: "rgba(52, 152, 219, 0.14)", border: "rgba(52, 152, 219, 0.35)" },
  probationary: { color: colors.orange, background: "rgba(243, 156, 18, 0.14)", border: "rgba(243, 156, 18, 0.35)" },
  pending: { color: colors.goldSoft, background: "rgba(122, 101, 52, 0.16)", border: "rgba(226, 196, 122, 0.4)" },
  rejected: { color: colors.textDim, background: "rgba(217, 224, 237, 0.1)", border: "rgba(217, 224, 237, 0.22)" },
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.pending;
  return (
    <View style={[styles.badge, { backgroundColor: tone.background, borderColor: tone.border }]}>
      <Text style={[styles.text, { color: tone.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
});
