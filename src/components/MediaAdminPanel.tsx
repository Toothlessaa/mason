import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff, ImagePlus, Pencil, RefreshCw, Trash2, Upload, X } from "lucide-react";
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
} from "../data/memberPortal";

const categories = ["Ceremony", "Community", "Brotherhood", "Announcement"];

type SelectedImagePreview = {
  file: File;
  url: string;
};

export function MediaAdminPanel({ adminName }: { adminName: string }) {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingPost, setEditingPost] = useState<MediaPost | null>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<MediaPost | null>(null);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<SelectedImagePreview[]>([]);
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
    loadMediaPosts();
  }, []);

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImagePreviews]);

  const clearSelectedImagePreviews = () => {
    setSelectedImagePreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));
      return [];
    });
    setThumbnailIndex(0);
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files || []);
    clearSelectedImagePreviews();
    setSelectedImagePreviews(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
    setThumbnailIndex(0);
  };

  const removeSelectedImagePreview = (imageIndex: number) => {
    setSelectedImagePreviews((current) => {
      const preview = current[imageIndex];
      if (preview) URL.revokeObjectURL(preview.url);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedImageFiles = selectedImagePreviews.map((preview) => preview.file).filter((file) => file.size > 0);
    const imageFiles = selectedImageFiles;
    const thumbnailFile = selectedImagePreviews[thumbnailIndex]?.file;
    const orderedImageFiles = thumbnailFile
      ? [thumbnailFile, ...imageFiles.filter((file) => file !== thumbnailFile)]
      : imageFiles;

    if (!editingPost && !orderedImageFiles.length) {
      setMessage("Please choose at least one image to upload.");
      setSaving(false);
      return;
    }

    const input = {
      title: String(formData.get("title") || "").trim(),
      category: String(formData.get("category") || "Ceremony").trim(),
      date: String(formData.get("date") || new Date().getFullYear()).trim(),
      summary: String(formData.get("summary") || "").trim(),
      status: String(formData.get("status") || "draft") as MediaPostStatus,
      createdBy: adminName,
    };

    const { error } = editingPost
      ? await updateMediaPost(editingPost, input, orderedImageFiles)
      : await createMediaPost(input, orderedImageFiles);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    form.reset();
    setEditingPost(null);
    clearSelectedImagePreviews();
    setMessage(editingPost ? "Media post updated." : "Media post saved.");
    await loadMediaPosts();
    setSaving(false);
  };

  const startEditing = (post: MediaPost) => {
    setEditingPost(post);
    clearSelectedImagePreviews();
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingPost(null);
    clearSelectedImagePreviews();
    setMessage("");
  };

  const handleStatusChange = async (postId: string, status: MediaPostStatus) => {
    setMessage("");
    const { error } = await updateMediaPostStatus(postId, status);
    if (error) setMessage(error.message);
    await loadMediaPosts();
  };

  const handleDelete = async () => {
    if (!postPendingDelete) return;
    setMessage("");
    setSaving(true);
    const { error } = await deleteMediaPost(postPendingDelete);
    if (error) setMessage(error.message);
    else if (editingPost?.id === postPendingDelete.id) cancelEditing();
    setPostPendingDelete(null);
    await loadMediaPosts();
    setSaving(false);
  };

  const handleDeleteImage = async (imageIndex: number) => {
    if (!editingPost) return;
    if (editingPostImages.length <= 1) {
      setMessage("A media post must keep at least one image. Delete the whole post instead.");
      return;
    }

    if (!window.confirm("Delete this picture from the media post?")) return;

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
  };

  return (
    <div className="admin-media-panel">
      <div className="members-table-card">
        <div className="members-table-heading">
          <ImagePlus size={20} strokeWidth={1.7} />
          <span>{editingPost ? "Edit Media Post" : "Media Posts"}</span>
        </div>

        <form className="admin-media-form inquiry-form" onSubmit={handleSubmit} key={editingPost?.id || "new-media-post"}>
          <div className="inquiry-field-grid">
            <label>
              <span>Title</span>
              <input name="title" required placeholder="Installation of Officers" defaultValue={editingPost?.title || ""} />
            </label>
            <label>
              <span>Category</span>
              <input name="category" list="media-category-options" required defaultValue={editingPost?.category || "Ceremony"} placeholder="Ceremony or custom category" />
              <datalist id="media-category-options">
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </datalist>
            </label>
            <label>
              <span>Date / Year</span>
              <input name="date" required placeholder="2026" defaultValue={editingPost?.date || new Date().getFullYear()} />
            </label>
            <label>
              <span>Status</span>
              <select name="status" defaultValue={editingPost?.status || "draft"}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea name="summary" required placeholder="Short description for this media post." defaultValue={editingPost?.summary || ""} />
          </label>

          <label>
            <span>{editingPost ? "Add More Images" : "Images"}</span>
            <input name="images" type="file" accept="image/*" multiple required={!editingPost} onChange={handleImageSelection} />
          </label>

          {selectedImagePreviews.length ? (
            <div className="admin-thumbnail-picker" aria-label="Choose post thumbnail">
              <div className="admin-thumbnail-picker-heading">
                <span>{editingPost ? `New Images To Add (${selectedImagePreviews.length})` : "Thumbnail"}</span>
                <small>{editingPost ? "These pictures are not public yet. Click Update Media Post to save them." : "Select which uploaded image appears first on the website."}</small>
              </div>
              <div className="admin-thumbnail-grid">
                {selectedImagePreviews.map((preview, index) => (
                  <div className={`admin-thumbnail-option${thumbnailIndex === index ? " is-selected" : ""}`} key={`${preview.file.name}-${preview.file.lastModified}-${index}`}>
                    <button className="admin-thumbnail-image-button" type="button" onClick={() => setThumbnailIndex(index)}>
                      <img src={preview.url} alt={`Selected upload ${index + 1}`} />
                      <span>{thumbnailIndex === index ? "Thumbnail" : "Set thumbnail"}</span>
                    </button>
                    <button className="admin-media-delete-button" type="button" onClick={() => removeSelectedImagePreview(index)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {editingPost ? (
            <div className="admin-current-gallery" aria-label="Current gallery pictures">
              <div className="admin-thumbnail-picker-heading">
                <span>Saved Gallery ({editingPostImages.length})</span>
                <small>These are the pictures already saved and used by the public media modal.</small>
              </div>
              <div className="admin-thumbnail-grid">
                {editingPostImages.map((image, index) => (
                  <div className="admin-current-gallery-item" key={`${image}-${index}`}>
                    <img src={image} alt={`${editingPost.title} ${index + 1}`} />
                    <button type="button" className="admin-media-delete-button" disabled={saving || editingPostImages.length <= 1} onClick={() => handleDeleteImage(index)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {message ? <p className="admin-media-message">{message}</p> : null}

          <div className="admin-media-form-actions">
            <button className="inquiry-submit" type="submit" disabled={saving}>
              <Upload size={18} strokeWidth={1.8} /> {saving ? "Saving..." : editingPost ? "Update Media Post" : "Post"}
            </button>
            {editingPost ? (
              <button className="admin-media-cancel-button" type="button" onClick={cancelEditing}>
                <X size={16} /> Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="members-table-card">
        <div className="members-table-heading admin-media-heading-row">
          <span>Uploaded Media</span>
          <button type="button" onClick={loadMediaPosts}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="admin-media-empty">Loading media posts...</p>
        ) : mediaPosts.length === 0 ? (
          <p className="admin-media-empty">No media posts yet.</p>
        ) : (
          <div className="admin-media-list">
            {mediaPosts.map((post) => (
              <article className="admin-media-card" key={post.id}>
                <img src={post.image_url} alt={post.title} />
                <div className="admin-media-card-copy">
                  <h3>{post.title}</h3>
                  <small>{getMediaPostImageUrls(post).length} saved photo{getMediaPostImageUrls(post).length === 1 ? "" : "s"}</small>
                </div>
                <div className="admin-media-actions">
                  <button type="button" className="admin-media-edit-button" onClick={() => startEditing(post)}>
                    <Pencil size={16} /> Edit
                  </button>
                  {post.status === "published" ? (
                    <button type="button" className="admin-media-draft-button" onClick={() => handleStatusChange(post.id, "draft")}>
                      <EyeOff size={16} /> Draft
                    </button>
                  ) : (
                    <button type="button" className="admin-media-publish-button" onClick={() => handleStatusChange(post.id, "published")}>
                      <Eye size={16} /> Publish
                    </button>
                  )}
                  <button type="button" className="admin-media-delete-button" onClick={() => setPostPendingDelete(post)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {postPendingDelete ? (
        <div className="admin-delete-modal-backdrop" role="presentation" onClick={() => setPostPendingDelete(null)}>
          <div className="admin-delete-modal" role="dialog" aria-modal="true" aria-labelledby="admin-delete-media-title" onClick={(event) => event.stopPropagation()}>
            <button className="admin-delete-modal-close" type="button" aria-label="Cancel delete" onClick={() => setPostPendingDelete(null)}>
              <X size={18} />
            </button>
            <div className="admin-delete-modal-icon">
              <Trash2 size={28} strokeWidth={1.8} />
            </div>
            <h3 id="admin-delete-media-title">Delete media post?</h3>
            <p>
              This will permanently delete <strong>{postPendingDelete.title}</strong> and remove its saved pictures from media storage.
            </p>
            <div className="admin-delete-modal-actions">
              <button type="button" className="admin-media-cancel-button" disabled={saving} onClick={() => setPostPendingDelete(null)}>
                Cancel
              </button>
              <button type="button" className="admin-media-delete-button" disabled={saving} onClick={handleDelete}>
                <Trash2 size={16} /> {saving ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
