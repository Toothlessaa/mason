import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import { GoldButton } from "../components/GoldButton";
import { Logos } from "../components/Logos";
import { getAdminSession, getSession } from "../lib/memberPortal";
import { colors, fontFamily, spacing } from "../theme";

type AutoDestination = "member" | "admin" | null;

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [checking, setChecking] = useState(true);
  const [auto, setAuto] = useState<AutoDestination>(null);

  useEffect(() => {
    (async () => {
      const memberSession = await getSession();
      if (memberSession) {
        setAuto("member");
        setChecking(false);
        return;
      }
      const adminSession = await getAdminSession();
      if (adminSession) {
        setAuto("admin");
        setChecking(false);
        return;
      }
      setChecking(false);
    })();
  }, []);

  const getStarted = () => {
    if (auto === "member") {
      navigation.reset({ index: 0, routes: [{ name: "Members" }] });
      return;
    }
    if (auto === "admin") {
      navigation.reset({ index: 0, routes: [{ name: "Admin" }] });
      return;
    }
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <LinearGradient
        colors={[colors.gradScreenTop, colors.bgTop, colors.gradScreenBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Logos />
          <Text style={styles.label}>Mt. Capistrano Masonic Lodge No. 23</Text>
          <Text style={styles.title}>The Members Portal</Text>
          <Text style={styles.subtitle}>
            The private app for verified lodge members and administrators.{"\n"}
            {auto ? "Welcome back — you are still signed in." : "Sign in with your lodge email and password."}
          </Text>
        </View>

        <View style={styles.actions}>
          <GoldButton
            title={auto ? "Continue" : "Get Started"}
            icon={<ArrowRight size={18} color="#0a1420" />}
            onPress={getStarted}
            loading={checking}
          />
          {auto === "member" ? (
            <View style={styles.autoRow}>
              <UserRound size={14} color={colors.gold} />
              <Text style={styles.autoText}>Signed in as member</Text>
            </View>
          ) : null}
          {auto === "admin" ? (
            <View style={styles.autoRow}>
              <ShieldCheck size={14} color={colors.gold} />
              <Text style={styles.autoText}>Signed in as administrator</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footnote}>District Grand Lodge of the Far East · Philippines &amp; Portugal</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: spacing.xl,
    paddingTop: 80,
    paddingBottom: 48,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
  },
  label: {
    marginTop: spacing.sm,
    color: colors.gold,
    fontSize: 13,
    fontFamily: fontFamily.extrabold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontFamily: fontFamily.extrabold,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    lineHeight: 21,
    textAlign: "center",
  },
  actions: {
    gap: spacing.md,
    alignItems: "center",
  },
  autoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  autoText: {
    color: colors.goldLight,
    fontSize: 13,
    fontFamily: fontFamily.semibold,
  },
  footnote: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 0.4,
  },
});