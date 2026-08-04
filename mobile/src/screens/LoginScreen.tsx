import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Check, Eye, EyeOff, LogIn } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import { Field } from "../components/Field";
import { GoldButton } from "../components/GoldButton";
import { Logos } from "../components/Logos";
import { signIn } from "../lib/memberPortal";
import { colors, fontFamily, fonts, radius, spacing } from "../theme";

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (busy) return;
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    const { member, error: signInError } = await signIn(email.trim(), password, remember);
    setBusy(false);

    if (signInError || !member) {
      setError(signInError?.message ?? "Sign in failed. Please try again.");
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: member.is_admin ? "Admin" : "Members" }] });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Logos />
          <Text style={styles.label}>Members Portal</Text>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Sign in with your lodge email and password.</Text>
        </View>

        <View style={styles.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
          />

          <View style={styles.passwordWrap}>
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={submit}
            />
            <Pressable
              style={styles.passwordToggle}
              onPress={() => setShowPassword((current) => !current)}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} color={colors.gold} /> : <Eye size={18} color={colors.gold} />}
            </Pressable>
          </View>

          <Pressable style={styles.rememberRow} onPress={() => setRemember((current) => !current)} accessibilityRole="checkbox" accessibilityState={{ checked: remember }}>
            <View style={[styles.checkbox, remember && styles.checkboxOn]}>
              {remember ? <Check size={13} color="#0a1420" strokeWidth={3} /> : null}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
            <Text style={styles.rememberHint}>stay signed in on this device</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GoldButton
            title="Sign In"
            icon={<LogIn size={18} color="#0a1420" />}
            onPress={submit}
            loading={busy}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  heading: {
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: fonts.heading,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    gap: spacing.lg,
  },
  passwordWrap: {
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: spacing.md,
    bottom: 12,
    padding: spacing.xs,
  },
  error: {
    color: colors.redSoft,
    fontSize: 13,
    fontWeight: "600",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  rememberText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  rememberHint: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11.5,
    textAlign: "right",
  },
  backText: {
    color: colors.goldLight,
    fontSize: 14,
  },
});