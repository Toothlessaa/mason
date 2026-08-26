import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Crown, Eye, EyeOff, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  createPastMaster,
  deletePastMaster,
  getAllPastMasters,
  updatePastMasterSortOrder,
  updatePastMasterStatus,
  type PastMaster,
  type PastMasterStatus,
} from "../data/memberPortal";

type SelectedImagePreview = {
  file: File;
  url: string;
};

export function PastMastersAdminPanel({ adminName }: { adminName: string }) {
  const [masters, setMasters] = useState<PastMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImagePreview, setSelectedImagePreview] = useState<SelectedImagePreview | null>(null);

  const loadMasters = async () => {
    setLoading(true);
    const { data, error } = await getAllPastMasters();
    if (error) setMessage(error.message);
    if (data) setMasters(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview.url);
    };
  }, [selectedImagePreview]);

  const clearSelectedImagePreview = () => {
    setSelectedImagePreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    clearSelectedImagePreview();
    if (file) {
      setSelectedImagePreview({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const yearServed = String(formData.get("year_served") || "").trim();
    const bio = String(formData.get("bio") || "").trim();
    const status = String(formData.get("status") || "draft") as PastMasterStatus;

    if (!name) {
      setMessage("Please enter a name.");
      setSaving(false);
      return;
    }

    const { error } = await createPastMaster({
      name,
      title: title || undefined,
      yearServed: yearServed || undefined,
      bio: bio || undefined,
      imageFile: selectedImagePreview?.file,
      status,
      createdBy: adminName,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    form.reset();
    clearSelectedImagePreview();
    setMessage("Past master added.");
    await loadMasters();
    setSaving(false);
  };

  const handleStatusChange = async (masterId: string, status: PastMasterStatus) => {
    setSaving(true);
    setMessage("");
    const { error } = await updatePastMasterStatus(masterId, status);
    if (error) setMessage(error.message);
    await loadMasters();
    setSaving(false);
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    const current = masters[index];
    const target = masters[targetIndex];
    if (!current || !target) return;

    setSaving(true);
    setMessage("");
    const currentOrder = current.sort_order;
    const targetOrder = target.sort_order;
    const nextCurrentOrder = currentOrder === targetOrder ? targetIndex : targetOrder;
    const nextTargetOrder = currentOrder === targetOrder ? index : currentOrder;

    const [currentUpdate, targetUpdate] = await Promise.all([
      updatePastMasterSortOrder(current.id, nextCurrentOrder),
      updatePastMasterSortOrder(target.id, nextTargetOrder),
    ]);

    if (currentUpdate.error || targetUpdate.error) setMessage(currentUpdate.error?.message || targetUpdate.error?.message || "Unable to reorder.");
    await loadMasters();
    setSaving(false);
  };

  const handleDelete = async (master: PastMaster) => {
    if (!window.confirm(`Delete past master "${master.name}"?`)) return;
    setSaving(true);
    setMessage("");
    const { error } = await deletePastMaster(master);
    if (error) setMessage(error.message);
    else setMessage("Past master deleted.");
    await loadMasters();
    setSaving(false);
  };

  return (
    <div className="admin-media-panel leadership-admin-panel">
      <div className="members-table-card">
        <div className="members-table-heading">
          <Crown size={20} strokeWidth={1.7} />
          <span>Add Past Master</span>
        </div>

        <form className="admin-media-form inquiry-form" onSubmit={handleSubmit}>
          <div className="inquiry-field-grid leadership-upload-grid">
            <label>
              <span>Name *</span>
              <input name="name" type="text" required placeholder="e.g. Bro. Juan Dela Cruz" />
            </label>
            <label>
              <span>Title</span>
              <input name="title" type="text" placeholder="e.g. Worshipful Master" />
            </label>
            <label>
              <span>Year Served</span>
              <input name="year_served" type="text" placeholder="e.g. 2020 - 2021" />
            </label>
            <label>
              <span>Photo</span>
              <input name="image" type="file" accept="image/*" onChange={handleImageSelection} />
            </label>
            <label>
              <span>Status</span>
              <select name="status" defaultValue="published">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label style={{ display: "block", marginBottom: "12px" }}>
            <span>Bio</span>
            <textarea
              name="bio"
              rows={3}
              placeholder="Brief description of their service..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(226,196,122,0.18)",
                background: "rgba(255,255,255,0.04)",
                color: "inherit",
                fontSize: "0.85rem",
                resize: "vertical",
              }}
            />
          </label>

          {selectedImagePreview ? (
            <div className="admin-thumbnail-picker" aria-label="Selected photo">
              <div className="admin-thumbnail-picker-heading">
                <span>Photo Preview</span>
              </div>
              <div className="admin-thumbnail-grid">
                <div className="admin-thumbnail-option">
                  <div className="admin-thumbnail-image-button">
                    <img src={selectedImagePreview.url} alt="Selected past master photo" />
                  </div>
                  <button className="admin-media-delete-button" type="button" onClick={clearSelectedImagePreview}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {message ? <p className="admin-media-message">{message}</p> : null}

          <div className="admin-media-form-actions">
            <button className="inquiry-submit" type="submit" disabled={saving}>
              <Upload size={18} strokeWidth={1.8} /> {saving ? "Saving..." : "Add Past Master"}
            </button>
          </div>
        </form>
      </div>

      <div className="members-table-card">
        <div className="members-table-heading admin-media-heading-row">
          <span>Past Masters ({masters.length})</span>
          <button type="button" onClick={loadMasters}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="admin-media-empty">Loading past masters...</p>
        ) : masters.length === 0 ? (
          <p className="admin-media-empty">No past masters yet.</p>
        ) : (
          <div className="admin-media-list leadership-slide-admin-list">
            {masters.map((master, index) => (
              <article className="admin-media-card leadership-slide-admin-card" key={master.id}>
                {master.image_url ? (
                  <img src={master.image_url} alt={master.name} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: "rgba(226,196,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Crown size={28} strokeWidth={1.2} style={{ opacity: 0.4 }} />
                  </div>
                )}
                <div className="admin-media-card-copy">
                  <h3>{master.name}</h3>
                  <small>{master.title || "Past Master"}{master.year_served ? ` — ${master.year_served}` : ""}</small>
                  <small style={{ opacity: 0.6 }}>{master.status === "published" ? "Published" : "Draft"}</small>
                </div>
                <div className="admin-media-actions leadership-slide-actions">
                  <button type="button" className="admin-media-edit-button" disabled={saving || index === 0} onClick={() => handleMove(index, -1)}>
                    <ArrowUp size={16} /> Up
                  </button>
                  <button type="button" className="admin-media-edit-button" disabled={saving || index === masters.length - 1} onClick={() => handleMove(index, 1)}>
                    <ArrowDown size={16} /> Down
                  </button>
                  {master.status === "published" ? (
                    <button type="button" className="admin-media-draft-button" disabled={saving} onClick={() => handleStatusChange(master.id, "draft")}>
                      <EyeOff size={16} /> Draft
                    </button>
                  ) : (
                    <button type="button" className="admin-media-publish-button" disabled={saving} onClick={() => handleStatusChange(master.id, "published")}>
                      <Eye size={16} /> Publish
                    </button>
                  )}
                  <button type="button" className="admin-media-delete-button" disabled={saving} onClick={() => handleDelete(master)}>
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
