import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../theme";
import districtLogo from "../../assets/district-logo.jpeg";
import lodgeLogo from "../../assets/lodge-logo.jpg";

export function Logos({ style, size = 46 }: { style?: StyleProp<ViewStyle>; size?: number }) {
  const logo = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.row, style]} aria-label="Lodge logos">
      <Image source={districtLogo} style={[styles.logo, logo]} resizeMode="contain" />
      <Image source={lodgeLogo} style={[styles.logo, logo]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.35)",
  },
});
