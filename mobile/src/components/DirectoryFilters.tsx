import { LinearGradient } from "expo-linear-gradient";
import { Search, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fontFamily, radius, shadows, sizes, spacing } from "../theme";

type DirectoryFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  placeholder?: string;
};

export function DirectoryFilters({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  placeholder = "Search by name, role or email...",
}: DirectoryFiltersProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.wrap}>
      <View style={[styles.searchBox, focused && styles.searchBoxFocused]}>
        <Search size={18} color={focused ? colors.gold : colors.textDim} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={query}
          onChangeText={onQueryChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSoft}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable style={styles.iconBox} onPress={() => onQueryChange("")} accessibilityLabel="Clear search">
            <X size={16} color={colors.textDim} />
          </Pressable>
        ) : null}
        <Pressable style={[styles.iconBox, styles.filterBox]} onPress={() => inputRef.current?.focus()} accessibilityLabel="Filter settings">
          <SlidersHorizontal size={16} color={colors.gold} />
        </Pressable>
      </View>

      {categories.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
          {categories.map((category) => {
            const active = category === activeCategory;
            return <Chip key={category} label={category} active={active} onPress={() => onCategoryChange(category)} />;
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scale, { toValue: active ? 1.04 : 1, duration: 200, useNativeDriver: true }).start();
  }, [active, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {active ? (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
          <LinearGradient
            colors={[colors.gradGoldStart, colors.gradGoldEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chipFill}
          >
            <Text style={styles.chipTextActive}>{label}</Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, styles.chipInactive, pressed && styles.chipPressed]}>
          <Text style={styles.chipText}>{label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    height: sizes.searchHeight,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    ...shadows.soft,
  },
  searchBoxFocused: {
    borderWidth: 1,
    borderColor: colors.goldGlow,
    ...shadows.gold,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    minHeight: sizes.searchHeight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBox: {
    backgroundColor: "rgba(226, 196, 122, 0.1)",
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    overflow: "hidden",
    minHeight: sizes.touch,
    justifyContent: "center",
  },
  chipFill: {
    flex: 1,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  chipInactive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.18)",
    paddingHorizontal: spacing.lg,
    ...shadows.soft,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: colors.textSoft,
    fontSize: 13,
    fontFamily: fontFamily.semibold,
  },
  chipTextActive: {
    color: "#0a1420",
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
});
