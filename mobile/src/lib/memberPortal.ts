import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { decode } from "base64-arraybuffer";
import { getItem, setItem, deleteItem } from "./storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MemberProfile = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string | null;
  address: string | null;
  member_since: string | null;
  status: "Pending" | "Active" | "Honorary" | "Probationary" | "Rejected";
  is_freemason: string | null;
  is_admin: boolean;
  push_token?: string | null;
  created_at: string;
};

export function resolveDisplayStatus(member: { role?: string | null; status: string }): string {
  if ((member.role ?? "").trim().toLowerCase() === "pending member") return "Pending";
  return member.status;
}

export type MediaPostStatus = "draft" | "published";

export type MediaPost = {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  image_url: string;
  image_urls: string[] | null;
  storage_path: string | null;
  storage_paths: string[] | null;
  status: MediaPostStatus;
  created_by: string | null;
  created_at: string;
};

export type LeadershipSlideStatus = "draft" | "published";

export type LeadershipSlide = {
  id: string;
  image_url: string;
  storage_path: string | null;
  status: LeadershipSlideStatus;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type MediaPostInput = {
  title: string;
  category: string;
  date: string;
  summary: string;
  status: MediaPostStatus;
  createdBy?: string;
};

function normalizeMediaArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && Boolean(item));
  } catch {
    // Some older data may be a plain URL string instead of a text array.
  }

  return [value].filter(Boolean);
}

export function getMediaPostImageUrls(post: MediaPost) {
  const imageUrls = normalizeMediaArray(post.image_urls);
  return imageUrls.length ? imageUrls : [post.image_url].filter(Boolean);
}

export function getMediaPostStoragePaths(post: MediaPost) {
  const storagePaths = normalizeMediaArray(post.storage_paths);
  return storagePaths.length ? storagePaths : [post.storage_path].filter((path): path is string => Boolean(path));
}

// --- Auth functions ---

// --- Session management (cross-platform: localStorage on web, SecureStore on native) ---
// When "remember me" is off, sessions live only in memory and vanish when the app closes.

const SESSION_KEY = "masonic_session";
const ADMIN_SESSION_KEY = "masonic_admin_session";

type SessionType = "member" | "admin";

const memorySessions: Record<SessionType, MemberProfile | null> = { member: null, admin: null };
const memoryRemembered: Record<SessionType, boolean> = { member: false, admin: false };

function sessionKey(type: SessionType) {
  return type === "admin" ? ADMIN_SESSION_KEY : SESSION_KEY;
}

async function saveSession(member: MemberProfile, type: SessionType, remember: boolean) {
  memorySessions[type] = member;
  memoryRemembered[type] = remember;
  if (remember) {
    await setItem(sessionKey(type), JSON.stringify(member));
  } else {
    await deleteItem(sessionKey(type));
  }
}

async function clearSession(type: SessionType) {
  memorySessions[type] = null;
  memoryRemembered[type] = false;
  await deleteItem(sessionKey(type));
}

export async function clearAllSessions() {
  memorySessions.member = null;
  memorySessions.admin = null;
  memoryRemembered.member = false;
  memoryRemembered.admin = false;
  await Promise.all([deleteItem(SESSION_KEY), deleteItem(ADMIN_SESSION_KEY)]);
}

export async function getSession(): Promise<MemberProfile | null> {
  if (memorySessions.member) return memorySessions.member;
  try {
    const raw = await getItem(SESSION_KEY);
    if (!raw) return null;
    const member = JSON.parse(raw) as MemberProfile;
    memorySessions.member = member;
    memoryRemembered.member = true;
    return member;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<MemberProfile | null> {
  if (memorySessions.admin) return memorySessions.admin;
  try {
    const raw = await getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const member = JSON.parse(raw) as MemberProfile;
    memorySessions.admin = member;
    memoryRemembered.admin = true;
    return member;
  } catch {
    return null;
  }
}

// --- Auth functions ---

async function queryMemberByEmail(email: string) {
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  return data as (MemberProfile & { password?: string }) | null;
}

export async function signIn(email: string, password: string, remember = true) {
  const data = await queryMemberByEmail(email);
  if (!data || !data.password) {
    return { member: null, error: new Error("Invalid email or password.") };
  }

  const valid = bcrypt.compareSync(password, data.password);
  if (!valid) {
    return { member: null, error: new Error("Invalid email or password.") };
  }

  const { password: _password, ...profile } = data;
  const type: SessionType = data.is_admin ? "admin" : "member";
  await saveSession(profile, type, remember);
  return { member: profile, error: null };
}

export async function signOut() {
  await clearAllSessions();
  return { error: null };
}

// --- Push notifications ---

export async function registerPushToken(memberId: string, token: string) {
  const { data, error } = await supabase
    .from("members")
    .update({ push_token: token })
    .eq("id", memberId)
    .select()
    .single();

  return { member: data as MemberProfile | null, error };
}

export async function getAdminPushTokens() {
  const { data, error } = await supabase
    .from("members")
    .select("push_token")
    .eq("is_admin", true)
    .not("push_token", "is", null);

  const tokens = (data ?? []).flatMap((row) => (typeof row.push_token === "string" ? [row.push_token] : []));
  return { tokens, error };
}

// --- Members directory ---

export async function getMembers(statuses: string[] = ["Active", "Honorary"]) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .in("status", statuses)
    .order("name");

  return { data: data as MemberProfile[] | null, error };
}

// --- Admin functions ---

export async function getAllMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data as MemberProfile[] | null, error };
}

export async function updateMemberStatus(memberId: string, status: string) {
  const { data, error } = await supabase
    .from("members")
    .update({ status })
    .eq("id", memberId)
    .select()
    .single();

  return { data: data as MemberProfile | null, error };
}

export async function updateMemberProfile(
  memberId: string,
  fields: { phone?: string | null; address?: string | null }
) {
  const updates: Record<string, string | null> = {};
  if (fields.phone !== undefined) updates.phone = fields.phone?.trim() || null;
  if (fields.address !== undefined) updates.address = fields.address?.trim() || null;

  const { data, error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", memberId)
    .select()
    .single();

  if (error || !data) {
    return { member: null as MemberProfile | null, error: error || new Error("Unable to update profile.") };
  }

  const member = data as MemberProfile;
  const type: SessionType = member.is_admin ? "admin" : "member";
  await saveSession(member, type, memoryRemembered[type]);
  return { member, error: null };
}

// --- Media management ---

const MEDIA_BUCKET = "media";
const LEADERSHIP_SLIDES_FOLDER = "leadership-slideshow";

function getSafeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

async function readImageAsArrayBuffer(image: UploadImage) {
  const FileSystem = await import("expo-file-system/legacy");
  const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: FileSystem.EncodingType.Base64 });
  return decode(base64);
}

async function uploadFileBody(image: UploadImage) {
  if (image.file) return image.file;
  return readImageAsArrayBuffer(image);
}

export type UploadImage = {
  uri: string;
  name: string;
  type: string;
  file?: File;
};

export async function getPublishedMediaPosts() {
  const { data, error } = await supabase
    .from("media_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return { data: data as MediaPost[] | null, error };
}

export async function getAllMediaPosts() {
  const { data, error } = await supabase
    .from("media_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data as MediaPost[] | null, error };
}

export async function uploadMediaImage(image: UploadImage) {
  const storagePath = `${Date.now()}-${getSafeFileName(image.name)}`;
  const body = await uploadFileBody(image);

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, body, {
    cacheControl: "3600",
    contentType: image.type || "image/jpeg",
    upsert: false,
  });

  if (error) return { imageUrl: null, storagePath: null, error };

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return { imageUrl: data.publicUrl, storagePath, error: null };
}

async function uploadLeadershipSlideImage(image: UploadImage) {
  const storagePath = `${LEADERSHIP_SLIDES_FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${getSafeFileName(image.name)}`;
  const body = await uploadFileBody(image);

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, body, {
    cacheControl: "3600",
    contentType: image.type || "image/jpeg",
    upsert: false,
  });

  if (error) return { imageUrl: null, storagePath: null, error };

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return { imageUrl: data.publicUrl, storagePath, error: null };
}

async function uploadMediaImages(images: UploadImage[]) {
  const imageUrls: string[] = [];
  const storagePaths: string[] = [];

  for (const image of images) {
    const upload = await uploadMediaImage(image);
    if (upload.error || !upload.imageUrl) {
      if (storagePaths.length) await supabase.storage.from(MEDIA_BUCKET).remove(storagePaths);
      return { imageUrls: null, storagePaths: null, error: upload.error || new Error("Unable to upload image.") };
    }

    imageUrls.push(upload.imageUrl);
    if (upload.storagePath) storagePaths.push(upload.storagePath);
  }

  return { imageUrls, storagePaths, error: null };
}

export async function createMediaPost(input: MediaPostInput, images: UploadImage[]) {
  const upload = await uploadMediaImages(images);
  if (upload.error || !upload.imageUrls?.length) {
    return { data: null, error: upload.error || new Error("Unable to upload images.") };
  }

  const { data, error } = await supabase
    .from("media_posts")
    .insert({
      title: input.title,
      category: input.category,
      date: input.date,
      summary: input.summary,
      image_url: upload.imageUrls[0],
      image_urls: upload.imageUrls,
      storage_path: upload.storagePaths?.[0] || null,
      storage_paths: upload.storagePaths || [],
      status: input.status,
      created_by: input.createdBy || null,
    })
    .select()
    .single();

  return { data: data as MediaPost | null, error };
}

export async function updateMediaPost(post: MediaPost, input: MediaPostInput, images: UploadImage[] = []) {
  const upload = images.length ? await uploadMediaImages(images) : { imageUrls: [] as string[], storagePaths: [] as string[], error: null };
  if (upload.error) {
    return { data: null, error: upload.error };
  }

  const existingImageUrls = getMediaPostImageUrls(post);
  const existingStoragePaths = getMediaPostStoragePaths(post);
  const imageUrls = [...existingImageUrls, ...(upload.imageUrls || [])];
  const storagePaths = [...existingStoragePaths, ...(upload.storagePaths || [])];

  const { data, error } = await supabase
    .from("media_posts")
    .update({
      title: input.title,
      category: input.category,
      date: input.date,
      summary: input.summary,
      image_url: imageUrls[0] || post.image_url,
      image_urls: imageUrls,
      storage_path: storagePaths[0] || post.storage_path,
      storage_paths: storagePaths,
      status: input.status,
      created_by: input.createdBy || post.created_by,
    })
    .eq("id", post.id)
    .select()
    .single();

  return { data: data as MediaPost | null, error };
}

export async function updateMediaPostStatus(postId: string, status: MediaPostStatus) {
  const { data, error } = await supabase
    .from("media_posts")
    .update({ status })
    .eq("id", postId)
    .select()
    .single();

  return { data: data as MediaPost | null, error };
}

export async function deleteMediaPostImage(post: MediaPost, imageIndex: number) {
  const imageUrls = getMediaPostImageUrls(post);
  const storagePaths = getMediaPostStoragePaths(post);

  if (imageUrls.length <= 1) {
    return { data: null, error: new Error("A media post must keep at least one image.") };
  }

  if (imageIndex < 0 || imageIndex >= imageUrls.length) {
    return { data: null, error: new Error("Image not found.") };
  }

  const removedStoragePath = storagePaths[imageIndex];
  const nextImageUrls = imageUrls.filter((_, index) => index !== imageIndex);
  const nextStoragePaths = storagePaths.filter((_, index) => index !== imageIndex);

  if (removedStoragePath) {
    const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([removedStoragePath]);
    if (removeError) return { data: null, error: removeError };
  }

  const { data, error } = await supabase
    .from("media_posts")
    .update({
      image_url: nextImageUrls[0],
      image_urls: nextImageUrls,
      storage_path: nextStoragePaths[0] || null,
      storage_paths: nextStoragePaths,
    })
    .eq("id", post.id)
    .select()
    .single();

  return { data: data as MediaPost | null, error };
}

export async function deleteMediaPost(post: MediaPost) {
  const storagePaths = getMediaPostStoragePaths(post);
  if (storagePaths.length) {
    await supabase.storage.from(MEDIA_BUCKET).remove([...new Set(storagePaths)]);
  }

  const { error } = await supabase
    .from("media_posts")
    .delete()
    .eq("id", post.id);

  return { error };
}

// --- Leadership slideshow management ---

export async function getPublishedLeadershipSlides() {
  const { data, error } = await supabase
    .from("leadership_slides")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return { data: data as LeadershipSlide[] | null, error };
}

export async function getAllLeadershipSlides() {
  const { data, error } = await supabase
    .from("leadership_slides")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return { data: data as LeadershipSlide[] | null, error };
}

export async function createLeadershipSlides({
  images,
  status,
  createdBy,
}: {
  images: UploadImage[];
  status: LeadershipSlideStatus;
  createdBy?: string;
}) {
  const uploadedSlides: Array<{ image_url: string; storage_path: string | null; status: LeadershipSlideStatus; sort_order: number; created_by: string | null }> = [];
  const uploadedStoragePaths: string[] = [];
  const sortStart = Date.now();

  for (const [index, image] of images.entries()) {
    const upload = await uploadLeadershipSlideImage(image);
    if (upload.error || !upload.imageUrl) {
      if (uploadedStoragePaths.length) await supabase.storage.from(MEDIA_BUCKET).remove(uploadedStoragePaths);
      return { data: null, error: upload.error || new Error("Unable to upload slideshow image.") };
    }

    if (upload.storagePath) uploadedStoragePaths.push(upload.storagePath);
    uploadedSlides.push({
      image_url: upload.imageUrl,
      storage_path: upload.storagePath,
      status,
      sort_order: sortStart + index,
      created_by: createdBy || null,
    });
  }

  const { data, error } = await supabase
    .from("leadership_slides")
    .insert(uploadedSlides)
    .select();

  if (error) {
    if (uploadedStoragePaths.length) await supabase.storage.from(MEDIA_BUCKET).remove(uploadedStoragePaths);
    return { data: null, error };
  }

  return { data: data as LeadershipSlide[] | null, error: null };
}

export async function updateLeadershipSlideStatus(slideId: string, status: LeadershipSlideStatus) {
  const { data, error } = await supabase
    .from("leadership_slides")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", slideId)
    .select()
    .single();

  return { data: data as LeadershipSlide | null, error };
}

export async function updateLeadershipSlideSortOrder(slideId: string, sortOrder: number) {
  const { data, error } = await supabase
    .from("leadership_slides")
    .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
    .eq("id", slideId)
    .select()
    .single();

  return { data: data as LeadershipSlide | null, error };
}

export async function deleteLeadershipSlide(slide: LeadershipSlide) {
  if (slide.storage_path) {
    const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([slide.storage_path]);
    if (removeError) return { error: removeError };
  }

  const { error } = await supabase
    .from("leadership_slides")
    .delete()
    .eq("id", slide.id);

  return { error };
}
