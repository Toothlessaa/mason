import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  createMediaPost,
  deleteMediaPost,
  getAllMediaPosts,
  updateMediaPostStatus,
  type MediaPost,
  type MediaPostStatus,
} from "../data/memberPortal";

const categories = ["Ceremony", "Community", "Brotherhood", "Announcement"];

export function MediaAdminPanel({ adminName }: { adminName: string }) {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get("image") as File | null;

    if (!imageFile?.size) {
      setMessage("Please choose an image to upload.");
      setSaving(false);
      return;
    }

    const { error } = await createMediaPost(
      {
        title: String(formData.get("title") || "").trim(),
        category: String(formData.get("category") || "Ceremony"),
        date: String(formData.get("date") || new Date().getFullYear()).trim(),
        summary: String(formData.get("summary") || "").trim(),
        status: String(formData.get("status") || "draft") as MediaPostStatus,
        createdBy: adminName,
      },
      imageFile,
    );

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    form.reset();
    setMessage("Media post saved.");
    await loadMediaPosts();
    setSaving(false);
  };

  const handleStatusChange = async (postId: string, status: MediaPostStatus) => {
    setMessage("");
    const { error } = await updateMediaPostStatus(postId, status);
    if (error) setMessage(error.message);
    await loadMediaPosts();
  };

  const handleDelete = async (post: MediaPost) => {
    if (!window.confirm(`Delete "${post.title}" from media?`)) return;
    setMessage("");
    const { error } = await deleteMediaPost(post);
    if (error) setMessage(error.message);
    await loadMediaPosts();
  };

  return (
    <div className="admin-media-panel">
      <div className="members-table-card">
        <div className="members-table-heading">
          <ImagePlus size={20} strokeWidth={1.7} />
          <span>Media Posts</span>
        </div>

        <form className="admin-media-form inquiry-form" onSubmit={handleSubmit}>
          <div className="inquiry-field-grid">
            <label>
              <span>Title</span>
              <input name="title" required placeholder="Installation of Officers" />
            </label>
            <label>
              <span>Category</span>
              <select name="category" defaultValue="Ceremony">
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Date / Year</span>
              <input name="date" required placeholder="2026" defaultValue={new Date().getFullYear()} />
            </label>
            <label>
              <span>Status</span>
              <select name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea name="summary" required placeholder="Short description for this media post." />
          </label>

          <label>
            <span>Image</span>
            <input name="image" type="file" accept="image/*" required />
          </label>

          {message ? <p className="admin-media-message">{message}</p> : null}

          <button className="inquiry-submit" type="submit" disabled={saving}>
            <Upload size={18} strokeWidth={1.8} /> {saving ? "Saving..." : "Save Media Post"}
          </button>
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
                  <div className="media-card-meta">
                    <span>{post.category}</span>
                    <span>{post.date}</span>
                    <span>{post.status}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                </div>
                <div className="admin-media-actions">
                  {post.status === "published" ? (
                    <button type="button" className="admin-media-draft-button" onClick={() => handleStatusChange(post.id, "draft")}>
                      <EyeOff size={16} /> Draft
                    </button>
                  ) : (
                    <button type="button" className="admin-media-publish-button" onClick={() => handleStatusChange(post.id, "published")}>
                      <Eye size={16} /> Publish
                    </button>
                  )}
                  <button type="button" className="admin-media-delete-button" onClick={() => handleDelete(post)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
