import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./src/theme";
import { MemberDetailScreen } from "./src/screens/MemberDetailScreen";
import { AdminPanelScreen } from "./src/screens/AdminPanelScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MemberDirectoryScreen } from "./src/screens/MemberDirectoryScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import type { Section } from "./src/screens/AdminPanelScreen";
import { getAdminSession, getSession } from "./src/lib/memberPortal";
import { registerPushForMember, setupNotifications } from "./src/lib/push";
import type { MemberProfile } from "./src/lib/memberPortal";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Members: undefined;
  Admin: { section?: Section } | undefined;
  MemberDetail: { member: MemberProfile };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bgTop,
    card: colors.cardAlt,
    text: colors.text,
    border: "rgba(226, 196, 122, 0.18)",
    primary: colors.gold,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    setupNotifications();
    (async () => {
      const session = (await getSession()) ?? (await getAdminSession());
      if (!session) return;
      await registerPushForMember(session);
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgTop, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bgTop },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Members" component={MemberDirectoryScreen} />
          <Stack.Screen name="Admin" component={AdminPanelScreen} />
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
