import * as ImagePicker from "expo-image-picker";
import { Eye, EyeOff, ImagePlus, Pencil, RefreshCw, Trash2, Upload, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, InteractionManager, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Field } from "../components/Field";
import {
  createMediaPost,
  deleteMediaPost,
  deleteMediaPostImage,
  getAllMediaPosts,
  getMediaPostImageUrls,
  updateMediaPost,
  updateMediaPostStatus,
  type MediaPost,
  type MediaPostStatus,
  type UploadImage,
} from "../lib/memberPortal";
import { colors, fonts, radius, sizes, spacing } from "../theme";

const categories = ["Ceremony", "Community", "Brotherhood", "Announcement"];

type SelectedImage = UploadImage & { preview: string };

export function MediaPanel({ adminName }: { adminName: string }) {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingPost, setEditingPost] = useState<MediaPost | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Ceremony");
  const [date, setDate] = useState(String(new Date().getFullYear()));
  const [status, setStatus] = useState<MediaPostStatus>("draft");
  const [summary, setSummary] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const editingPostImages = editingPost ? getMediaPostImageUrls(editingPost) : [];

  const loadMediaPosts = async () => {
    setLoading(true);
    const { data, error } = await getAllMediaPosts();
    if (error) setMessage(error.message);
    if (data) setMediaPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(loadMediaPosts);
    return () => task.cancel();
  }, []);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setCategory(editingPost.category);
      setDate(editingPost.date);
      setStatus(editingPost.status);
      setSummary(editingPost.summary);
      setSelectedImages([]);
      setThumbnailIndex(0);
      setMessage("");
    }
  }, [editingPost]);

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
      name: asset.fileName || `image-${Date.now()}-${index}.jpg`,
      type: asset.mimeType || "image/jpeg",
      preview: asset.uri,
      file: (asset as { file?: File }).file,
    }));

    setSelectedImages((current) => [...current, ...picked]);
  };

  const removeSelectedImage = (imageIndex: number) => {
    setSelectedImages((current) => {
      const next = current.filter((_, index) => index !== imageIndex);
      setThumbnailIndex((currentThumbnailIndex) => {
        if (!next.length) return 0;
        if (currentThumbnailIndex === imageIndex) return 0;
        if (currentThumbnailIndex > imageIndex) return currentThumbnailIndex - 1;
        return currentThumbnailIndex;
      });
      return next;
    });
  };

  const submit = async () => {
    if (saving) return;
    setMessage("");

    if (!title.trim() || !summary.trim() || !date.trim()) {
      setMessage("Please fill in the title, date, and description.");
      return;
    }

    if (!editingPost && !selectedImages.length) {
      setMessage("Please choose at least one image to upload.");
      return;
    }

    const thumbnailFile = selectedImages[thumbnailIndex];
    const orderedImages = thumbnailFile
      ? [thumbnailFile, ...selectedImages.filter((image) => image !== thumbnailFile)]
      : selectedImages;

    setSaving(true);
    const input = {
      title: title.trim(),
      category: category.trim() || "Ceremony",
      date: date.trim(),
      summary: summary.trim(),
      status,
      createdBy: adminName,
    };

    const { error } = editingPost
      ? await updateMediaPost(editingPost, input, orderedImages)
      : await createMediaPost(input, orderedImages);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setEditingPost(null);
    setSelectedImages([]);
    setThumbnailIndex(0);
    setTitle("");
    setCategory("Ceremony");
    setDate(String(new Date().getFullYear()));
    setStatus("draft");
    setSummary("");
    setMessage(editingPost ? "Media post updated." : "Media post saved.");
    await loadMediaPosts();
    setSaving(false);
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setSelectedImages([]);
    setThumbnailIndex(0);
    setTitle("");
    setCategory("Ceremony");
    setDate(String(new Date().getFullYear()));
    setStatus("draft");
    setSummary("");
    setMessage("");
  };

  const handleStatusChange = async (postId: string, nextStatus: MediaPostStatus) => {
    setMessage("");
    const { error } = await updateMediaPostStatus(postId, nextStatus);
    if (error) setMessage(error.message);
    await loadMediaPosts();
  };

  const confirmDelete = (post: MediaPost) => {
    Alert.alert("Delete media post?", `This will permanently delete ${post.title} and remove its saved pictures from media storage.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Post",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          setMessage("");
          const { error } = await deleteMediaPost(post);
          if (error) setMessage(error.message);
          else if (editingPost?.id === post.id) cancelEditing();
          await loadMediaPosts();
          setSaving(false);
        },
      },
    ]);
  };

  const confirmDeleteImage = (imageIndex: number) => {
    if (!editingPost) return;
    if (editingPostImages.length <= 1) {
      setMessage("A media post must keep at least one image. Delete the whole post instead.");
      return;
    }

    Alert.alert("Delete this picture?", "Delete this picture from the media post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          setMessage("");
          const { data, error } = await deleteMediaPostImage(editingPost, imageIndex);
          if (error) {
            setMessage(error.message);
            setSaving(false);
            return;
          }

          if (data) setEditingPost(data);
          setMessage("Picture deleted from media post.");
          await loadMediaPosts();
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
          <Text style={styles.cardHeadingText}>{editingPost ? "Edit Media Post" : "Media Posts"}</Text>
        </View>

        <View style={styles.form}>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Installation of Officers" />
          <Field label="Category" value={category} onChangeText={setCategory} placeholder="Ceremony or custom category" />
          <View style={styles.chips}>
            {categories.map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="Date / Year" value={date} onChangeText={setDate} placeholder="2026" />
          <View style={styles.segmented}>
            {(["draft", "published"] as MediaPostStatus[]).map((item) => (
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
          <Field
            label="Description"
            value={summary}
            onChangeText={setSummary}
            placeholder="Short description for this media post."
            multiline
            numberOfLines={4}
            style={styles.textarea}
          />

          <View style={styles.uploadRow}>
            <Pressable style={styles.pickButton} onPress={pickImages}>
              <ImagePlus size={16} color="#0a1420" />
              <Text style={styles.pickButtonText}>{editingPost ? "Add More Images" : "Choose Images"}</Text>
            </Pressable>
            {selectedImages.length > 0 ? (
              <Text style={styles.pickedCount}>{selectedImages.length} selected</Text>
            ) : null}
          </View>

          {selectedImages.length ? (
            <View style={styles.thumbSection}>
              <Text style={styles.thumbHeading}>{editingPost ? "New Images To Add" : "Thumbnail"}</Text>
              <Text style={styles.thumbHint}>
                {editingPost
                  ? "These pictures are not public yet. Click Save to upload them."
                  : "Tap a picture to choose which one appears first on the website."}
              </Text>
              <View style={styles.thumbGrid}>
                {selectedImages.map((image, index) => (
                  <View style={styles.thumbOption} key={`${image.name}-${index}`}>
                    <Pressable style={[styles.thumbImageWrap, thumbnailIndex === index && styles.thumbSelected]} onPress={() => setThumbnailIndex(index)}>
                      <Image source={{ uri: image.preview }} style={styles.thumbImage} />
                      <Text style={styles.thumbLabel}>{thumbnailIndex === index ? "Thumbnail" : "Set thumbnail"}</Text>
                    </Pressable>
                    <Pressable style={styles.removeButton} onPress={() => removeSelectedImage(index)}>
                      <Trash2 size={13} color={colors.redSoft} />
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {editingPost ? (
            <View style={styles.thumbSection}>
              <Text style={styles.thumbHeading}>Saved Gallery ({editingPostImages.length})</Text>
              <Text style={styles.thumbHint}>These pictures are already saved and used by the public media modal.</Text>
              <View style={styles.thumbGrid}>
                {editingPostImages.map((image, index) => (
                  <View style={styles.thumbOption} key={`${image}-${index}`}>
                    <View style={styles.thumbImageWrap}>
                      <Image source={{ uri: image }} style={styles.thumbImage} />
                    </View>
                    <Pressable
                      style={styles.removeButton}
                      disabled={saving || editingPostImages.length <= 1}
                      onPress={() => confirmDeleteImage(index)}
                    >
                      <Trash2 size={13} color={colors.redSoft} />
                      <Text style={styles.removeButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.formActions}>
            <Pressable style={styles.saveButton} onPress={submit} disabled={saving}>
              <Upload size={16} color="#0a1420" />
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : editingPost ? "Update Media Post" : "Post"}
              </Text>
            </Pressable>
            {editingPost ? (
              <Pressable style={styles.cancelButton} onPress={cancelEditing} disabled={saving}>
                <X size={15} color={colors.goldLight} />
                <Text style={styles.cancelButtonText}>Cancel Edit</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <Text style={styles.cardHeadingText}>Uploaded Media</Text>
          <Pressable style={styles.refreshButton} onPress={loadMediaPosts}>
            <RefreshCw size={14} color={colors.goldLight} />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={styles.empty}>Loading media posts...</Text>
        ) : mediaPosts.length === 0 ? (
          <Text style={styles.empty}>No media posts yet.</Text>
        ) : (
          <View style={styles.postList}>
            {mediaPosts.map((post) => {
              const imageCount = getMediaPostImageUrls(post).length;
              return (
                <View style={styles.postCard} key={post.id}>
                  <Image source={{ uri: post.image_url }} style={styles.postImage} />
                  <View style={styles.postCopy}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postMeta}>
                      {imageCount} saved photo{imageCount === 1 ? "" : "s"}
                    </Text>
                    <View style={styles.postActions}>
                      <Pressable style={styles.postAction} onPress={() => setEditingPost(post)}>
                        <Pencil size={14} color={colors.goldLight} />
                        <Text style={styles.postActionText}>Edit</Text>
                      </Pressable>
                      {post.status === "published" ? (
                        <Pressable style={styles.postAction} onPress={() => handleStatusChange(post.id, "draft")}>
                          <EyeOff size={14} color={colors.goldLight} />
                          <Text style={styles.postActionText}>Draft</Text>
                        </Pressable>
                      ) : (
                        <Pressable style={styles.postAction} onPress={() => handleStatusChange(post.id, "published")}>
                          <Eye size={14} color={colors.goldLight} />
                          <Text style={styles.postActionText}>Publish</Text>
                        </Pressable>
                      )}
                      <Pressable style={styles.postAction} onPress={() => confirmDelete(post)}>
                        <Trash2 size={14} color={colors.redSoft} />
                        <Text style={[styles.postActionText, { color: colors.redSoft }]}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
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
  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.25)",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#0a1420",
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
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  thumbSelected: {
    borderColor: colors.gold,
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
  formActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  saveButton: {
    flex: 1,
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
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(226, 196, 122, 0.35)",
  },
  cancelButtonText: {
    color: colors.goldLight,
    fontSize: 14,
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
  postList: {
    gap: spacing.md,
  },
  postCard: {
    flexDirection: "row",
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    overflow: "hidden",
    gap: spacing.md,
  },
  postImage: {
    width: 84,
    height: 84,
  },
  postCopy: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  postTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: fonts.semibold,
  },
  postMeta: {
    color: colors.textDim,
    fontSize: 11,
  },
  postActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postActionText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: "600",
  },
});
