import * as ImagePicker from "expo-image-picker";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  createLeadershipSlides,
  deleteLeadershipSlide,
  getAllLeadershipSlides,
  updateLeadershipSlideSortOrder,
  updateLeadershipSlideStatus,
  type LeadershipSlide,
  type LeadershipSlideStatus,
  type UploadImage,
} from "../lib/memberPortal";
import { colors, fonts, radius, sizes, spacing } from "../theme";

type SelectedImage = UploadImage & { preview: string };

export function SlideshowPanel({ adminName }: { adminName: string }) {
  const [slides, setSlides] = useState<LeadershipSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [status, setStatus] = useState<LeadershipSlideStatus>("published");

  const loadSlides = async () => {
    setLoading(true);
    const { data, error } = await getAllLeadershipSlides();
    if (error) setMessage(error.message);
    if (data) setSlides(data);
    setLoading(false);
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(loadSlides);
    return () => task.cancel();
  }, []);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Permission to access your photo library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (result.canceled) return;

    const picked: SelectedImage[] = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName || `slide-${Date.now()}-${index}.jpg`,
      type: asset.mimeType || "image/jpeg",
      preview: asset.uri,
      file: (asset as { file?: File }).file,
    }));

    setSelectedImages((current) => [...current, ...picked]);
  };

  const removeSelectedImage = (imageIndex: number) => {
    setSelectedImages((current) => current.filter((_, index) => index !== imageIndex));
  };

  const submit = async () => {
    if (saving) return;
    setMessage("");

    if (!selectedImages.length) {
      setMessage("Please choose at least one slideshow image.");
      return;
    }

    setSaving(true);
    const { error } = await createLeadershipSlides({ images: selectedImages, status, createdBy: adminName });
    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setSelectedImages([]);
    setMessage("Slideshow pictures uploaded.");
    await loadSlides();
    setSaving(false);
  };

  const handleStatusChange = async (slideId: string, nextStatus: LeadershipSlideStatus) => {
    setSaving(true);
    setMessage("");
    const { error } = await updateLeadershipSlideStatus(slideId, nextStatus);
    if (error) setMessage(error.message);
    await loadSlides();
    setSaving(false);
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    const current = slides[index];
    const target = slides[targetIndex];
    if (!current || !target) return;

    setSaving(true);
    setMessage("");
    const currentOrder = current.sort_order;
    const targetOrder = target.sort_order;
    const nextCurrentOrder = currentOrder === targetOrder ? targetIndex : targetOrder;
    const nextTargetOrder = currentOrder === targetOrder ? index : currentOrder;

    const [currentUpdate, targetUpdate] = await Promise.all([
      updateLeadershipSlideSortOrder(current.id, nextCurrentOrder),
      updateLeadershipSlideSortOrder(target.id, nextTargetOrder),
    ]);

    if (currentUpdate.error || targetUpdate.error) {
      setMessage(currentUpdate.error?.message || targetUpdate.error?.message || "Unable to reorder slides.");
    }
    await loadSlides();
    setSaving(false);
  };

  const confirmDelete = (slide: LeadershipSlide) => {
    Alert.alert("Delete this slideshow picture?", "This picture will be removed from the slideshow.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          setMessage("");
          const { error } = await deleteLeadershipSlide(slide);
          if (error) setMessage(error.message);
          else setMessage("Slideshow picture deleted.");
          await loadSlides();
          setSaving(false);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <ImagePlus size={18} color={colors.gold} />
          <Text style={styles.cardHeadingText}>Leadership Slideshow</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.uploadRow}>
            <Pressable style={styles.pickButton} onPress={pickImages}>
              <ImagePlus size={16} color="#0a1420" />
              <Text style={styles.pickButtonText}>Choose Pictures</Text>
            </Pressable>
            {selectedImages.length > 0 ? (
              <Text style={styles.pickedCount}>{selectedImages.length} selected</Text>
            ) : null}
          </View>

          <View style={styles.segmented}>
            {(["draft", "published"] as LeadershipSlideStatus[]).map((item) => (
              <Pressable
                key={item}
                style={[styles.segment, status === item && styles.segmentActive]}
                onPress={() => setStatus(item)}
              >
                <Text style={[styles.segmentText, status === item && styles.segmentTextActive]}>
                  {item === "draft" ? "Draft" : "Published"}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedImages.length ? (
            <View style={styles.thumbSection}>
              <Text style={styles.thumbHeading}>Ready To Upload ({selectedImages.length})</Text>
              <Text style={styles.thumbHint}>
                These pictures will appear as captionless moving images below The Three Lights when published.
              </Text>
              <View style={styles.thumbGrid}>
                {selectedImages.map((image, index) => (
                  <View style={styles.thumbOption} key={`${image.name}-${index}`}>
                    <View style={styles.thumbImageWrap}>
                      <Image source={{ uri: image.preview }} style={styles.thumbImage} />
                      <Text style={styles.thumbLabel}>Picture {index + 1}</Text>
                    </View>
                    <Pressable style={styles.removeButton} onPress={() => removeSelectedImage(index)}>
                      <Trash2 size={13} color={colors.redSoft} />
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable style={styles.saveButton} onPress={submit} disabled={saving}>
            <Upload size={16} color="#0a1420" />
            <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Upload Pictures"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <Text style={styles.cardHeadingText}>Slideshow Pictures</Text>
          <Pressable style={styles.refreshButton} onPress={loadSlides}>
            <RefreshCw size={14} color={colors.goldLight} />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={styles.empty}>Loading slideshow pictures...</Text>
        ) : slides.length === 0 ? (
          <Text style={styles.empty}>No slideshow pictures yet.</Text>
        ) : (
          <View style={styles.slideList}>
            {slides.map((slide, index) => (
              <View style={styles.slideCard} key={slide.id}>
                <Image source={{ uri: slide.image_url }} style={styles.slideImage} />
                <View style={styles.slideCopy}>
                  <Text style={styles.slideTitle}>Slide {String(index + 1).padStart(2, "0")}</Text>
                  <Text style={styles.slideMeta}>
                    {slide.status === "published" ? "Published on website" : "Draft"}
                  </Text>
                  <View style={styles.slideActions}>
                    <Pressable
                      style={styles.slideAction}
                      disabled={saving || index === 0}
                      onPress={() => handleMove(index, -1)}
                    >
                      <ArrowUp size={14} color={colors.goldLight} />
                      <Text style={styles.slideActionText}>Up</Text>
                    </Pressable>
                    <Pressable
                      style={styles.slideAction}
                      disabled={saving || index === slides.length - 1}
                      onPress={() => handleMove(index, 1)}
                    >
                      <ArrowDown size={14} color={colors.goldLight} />
                      <Text style={styles.slideActionText}>Down</Text>
                    </Pressable>
                    {slide.status === "published" ? (
                      <Pressable style={styles.slideAction} disabled={saving} onPress={() => handleStatusChange(slide.id, "draft")}>
                        <EyeOff size={14} color={colors.goldLight} />
                        <Text style={styles.slideActionText}>Draft</Text>
                      </Pressable>
                    ) : (
                      <Pressable style={styles.slideAction} disabled={saving} onPress={() => handleStatusChange(slide.id, "published")}>
                        <Eye size={14} color={colors.goldLight} />
                        <Text style={styles.slideActionText}>Publish</Text>
                      </Pressable>
                    )}
                    <Pressable style={styles.slideAction} disabled={saving} onPress={() => confirmDelete(slide)}>
                      <Trash2 size={14} color={colors.redSoft} />
                      <Text style={[styles.slideActionText, { color: colors.redSoft }]}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
  panelContent: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: sizes.navHeight + 64,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.14)",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardHeadingText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: fonts.semibold,
    flex: 1,
  },
  form: {
    gap: spacing.lg,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  pickButtonText: {
    color: "#0a1420",
    fontSize: 14,
    fontWeight: fonts.semibold,
  },
  pickedCount: {
    color: colors.textDim,
    fontSize: 12,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.gold,
  },
  segmentText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#0a1420",
  },
  thumbSection: {
    gap: spacing.sm,
  },
  thumbHeading: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: fonts.semibold,
  },
  thumbHint: {
    color: colors.textDim,
    fontSize: 12,
  },
  thumbGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  thumbOption: {
    width: 108,
    gap: spacing.xs,
  },
  thumbImageWrap: {
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  thumbImage: {
    width: 108,
    height: 82,
  },
  thumbLabel: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  removeButtonText: {
    color: colors.redSoft,
    fontSize: 11,
    fontWeight: "600",
  },
  message: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  saveButtonText: {
    color: "#0a1420",
    fontSize: 14,
    fontWeight: fonts.heading,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  refreshButtonText: {
    color: colors.goldLight,
    fontSize: 12,
  },
  empty: {
    color: colors.textDim,
    textAlign: "center",
    padding: spacing.lg,
  },
  slideList: {
    gap: spacing.md,
  },
  slideCard: {
    flexDirection: "row",
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    overflow: "hidden",
    gap: spacing.md,
  },
  slideImage: {
    width: 84,
    height: 84,
  },
  slideCopy: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  slideTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: fonts.semibold,
  },
  slideMeta: {
    color: colors.textDim,
    fontSize: 11,
  },
  slideActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  slideAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  slideActionText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: "600",
  },
});
