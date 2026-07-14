import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  createLeadershipSlides,
  deleteLeadershipSlide,
  getAllLeadershipSlides,
  updateLeadershipSlideSortOrder,
  updateLeadershipSlideStatus,
  type LeadershipSlide,
  type LeadershipSlideStatus,
} from "../data/memberPortal";

type SelectedImagePreview = {
  file: File;
  url: string;
};

export function LeadershipSlideshowAdminPanel({ adminName }: { adminName: string }) {
  const [slides, setSlides] = useState<LeadershipSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<SelectedImagePreview[]>([]);

  const loadSlides = async () => {
    setLoading(true);
    const { data, error } = await getAllLeadershipSlides();
    if (error) setMessage(error.message);
    if (data) setSlides(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSlides();
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
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files || []);
    clearSelectedImagePreviews();
    setSelectedImagePreviews(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
  };

  const removeSelectedImagePreview = (imageIndex: number) => {
    setSelectedImagePreviews((current) => {
      const preview = current[imageIndex];
      if (preview) URL.revokeObjectURL(preview.url);
      return current.filter((_, index) => index !== imageIndex);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const imageFiles = selectedImagePreviews.map((preview) => preview.file).filter((file) => file.size > 0);
    const status = String(formData.get("status") || "draft") as LeadershipSlideStatus;

    if (!imageFiles.length) {
      setMessage("Please choose at least one slideshow image.");
      setSaving(false);
      return;
    }

    const { error } = await createLeadershipSlides({ imageFiles, status, createdBy: adminName });
    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    form.reset();
    clearSelectedImagePreviews();
    setMessage("Slideshow pictures uploaded.");
    await loadSlides();
    setSaving(false);
  };

  const handleStatusChange = async (slideId: string, status: LeadershipSlideStatus) => {
    setSaving(true);
    setMessage("");
    const { error } = await updateLeadershipSlideStatus(slideId, status);
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

    if (currentUpdate.error || targetUpdate.error) setMessage(currentUpdate.error?.message || targetUpdate.error?.message || "Unable to reorder slides.");
    await loadSlides();
    setSaving(false);
  };

  const handleDelete = async (slide: LeadershipSlide) => {
    if (!window.confirm("Delete this slideshow picture?")) return;
    setSaving(true);
    setMessage("");
    const { error } = await deleteLeadershipSlide(slide);
    if (error) setMessage(error.message);
    else setMessage("Slideshow picture deleted.");
    await loadSlides();
    setSaving(false);
  };

  return (
    <div className="admin-media-panel leadership-admin-panel">
      <div className="members-table-card">
        <div className="members-table-heading">
          <ImagePlus size={20} strokeWidth={1.7} />
          <span>Leadership Slideshow</span>
        </div>

        <form className="admin-media-form inquiry-form" onSubmit={handleSubmit}>
          <div className="inquiry-field-grid leadership-upload-grid">
            <label>
              <span>Pictures</span>
              <input name="images" type="file" accept="image/*" multiple required onChange={handleImageSelection} />
            </label>
            <label>
              <span>Status</span>
              <select name="status" defaultValue="published">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          {selectedImagePreviews.length ? (
            <div className="admin-thumbnail-picker" aria-label="Selected slideshow pictures">
              <div className="admin-thumbnail-picker-heading">
                <span>Ready To Upload ({selectedImagePreviews.length})</span>
                <small>These pictures will appear as captionless moving images below The Three Lights when published.</small>
              </div>
              <div className="admin-thumbnail-grid">
                {selectedImagePreviews.map((preview, index) => (
                  <div className="admin-thumbnail-option" key={`${preview.file.name}-${preview.file.lastModified}-${index}`}>
                    <button className="admin-thumbnail-image-button" type="button">
                      <img src={preview.url} alt={`Selected slideshow upload ${index + 1}`} />
                      <span>Picture {index + 1}</span>
                    </button>
                    <button className="admin-media-delete-button" type="button" onClick={() => removeSelectedImagePreview(index)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {message ? <p className="admin-media-message">{message}</p> : null}

          <div className="admin-media-form-actions">
            <button className="inquiry-submit" type="submit" disabled={saving}>
              <Upload size={18} strokeWidth={1.8} /> {saving ? "Saving..." : "Upload Pictures"}
            </button>
          </div>
        </form>
      </div>

      <div className="members-table-card">
        <div className="members-table-heading admin-media-heading-row">
          <span>Slideshow Pictures</span>
          <button type="button" onClick={loadSlides}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="admin-media-empty">Loading slideshow pictures...</p>
        ) : slides.length === 0 ? (
          <p className="admin-media-empty">No slideshow pictures yet.</p>
        ) : (
          <div className="admin-media-list leadership-slide-admin-list">
            {slides.map((slide, index) => (
              <article className="admin-media-card leadership-slide-admin-card" key={slide.id}>
                <img src={slide.image_url} alt={`Leadership slideshow picture ${index + 1}`} />
                <div className="admin-media-card-copy">
                  <h3>Slide {String(index + 1).padStart(2, "0")}</h3>
                  <small>{slide.status === "published" ? "Published on website" : "Draft"}</small>
                </div>
                <div className="admin-media-actions leadership-slide-actions">
                  <button type="button" className="admin-media-edit-button" disabled={saving || index === 0} onClick={() => handleMove(index, -1)}>
                    <ArrowUp size={16} /> Up
                  </button>
                  <button type="button" className="admin-media-edit-button" disabled={saving || index === slides.length - 1} onClick={() => handleMove(index, 1)}>
                    <ArrowDown size={16} /> Down
                  </button>
                  {slide.status === "published" ? (
                    <button type="button" className="admin-media-draft-button" disabled={saving} onClick={() => handleStatusChange(slide.id, "draft")}>
                      <EyeOff size={16} /> Draft
                    </button>
                  ) : (
                    <button type="button" className="admin-media-publish-button" disabled={saving} onClick={() => handleStatusChange(slide.id, "published")}>
                      <Eye size={16} /> Publish
                    </button>
                  )}
                  <button type="button" className="admin-media-delete-button" disabled={saving} onClick={() => handleDelete(slide)}>
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
