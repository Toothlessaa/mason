import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
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
  created_at: string;
};

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

type MediaPostInput = {
  title: string;
  category: string;
  date: string;
  summary: string;
  status: MediaPostStatus;
  createdBy?: string;
};

// --- Session management (localStorage) ---

const SESSION_KEY = "masonic_session";
const ADMIN_SESSION_KEY = "masonic_admin_session";

function saveSession(member: MemberProfile, isAdmin = false) {
  const key = isAdmin ? ADMIN_SESSION_KEY : SESSION_KEY;
  localStorage.setItem(key, JSON.stringify(member));
}

function clearSession(isAdmin = false) {
  const key = isAdmin ? ADMIN_SESSION_KEY : SESSION_KEY;
  localStorage.removeItem(key);
}

export function clearAllSessions() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getSession(): MemberProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemberProfile;
  } catch {
    return null;
  }
}

export function getAdminSession(): MemberProfile | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemberProfile;
  } catch {
    return null;
  }
}

export function getCurrentMember(): MemberProfile | null {
  return getSession();
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

export async function signIn(email: string, password: string) {
  const data = await queryMemberByEmail(email);
  if (!data || !data.password) {
    return { member: null, error: new Error("Invalid email or password.") };
  }

  const valid = bcrypt.compareSync(password, data.password);
  if (!valid) {
    return { member: null, error: new Error("Invalid email or password.") };
  }

  const { password: _, ...profile } = data;
  saveSession(profile);
  return { member: profile, error: null };
}

export async function adminSignIn(email: string, password: string) {
  const data = await queryMemberByEmail(email);
  if (!data || !data.password) {
    return { member: null, error: new Error("Invalid email or password.") };
  }

  const valid = bcrypt.compareSync(password, data.password);
  if (!valid) {
    return { member: null, error: new Error("Invalid email or password.") };
  }

  if (!data.is_admin) {
    return { member: null, error: new Error("Access denied. Admin privileges required.") };
  }

  const { password: _, ...profile } = data;
  saveSession(profile, true);
  return { member: profile, error: null };
}

export async function signUp(email: string, password: string, name: string, phone?: string, address?: string, freemasonInfo?: string) {
  const hash = bcrypt.hashSync(password, 10);

  const { data, error } = await supabase
    .from("members")
    .insert({
      name,
      email,
      password: hash,
      phone: phone || null,
      address: address || null,
      is_freemason: freemasonInfo || null,
      status: "Pending",
    })
    .select()
    .single();

  if (error) {
    return { member: null, error };
  }

  const { password: _, ...profile } = data as unknown as MemberProfile & { password?: string };
  return { member: profile, error: null };
}

export async function signOut() {
  clearAllSessions();
  return { error: null };
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

// --- Media management ---

const MEDIA_BUCKET = "media";

function getSafeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

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

export async function uploadMediaImage(file: File) {
  const storagePath = `${Date.now()}-${getSafeFileName(file.name)}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return { imageUrl: null, storagePath: null, error };

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return { imageUrl: data.publicUrl, storagePath, error: null };
}

async function uploadMediaImages(files: File[]) {
  const imageUrls: string[] = [];
  const storagePaths: string[] = [];

  for (const file of files) {
    const upload = await uploadMediaImage(file);
    if (upload.error || !upload.imageUrl) {
      if (storagePaths.length) await supabase.storage.from(MEDIA_BUCKET).remove(storagePaths);
      return { imageUrls: null, storagePaths: null, error: upload.error || new Error("Unable to upload image.") };
    }

    imageUrls.push(upload.imageUrl);
    if (upload.storagePath) storagePaths.push(upload.storagePath);
  }

  return { imageUrls, storagePaths, error: null };
}

export async function createMediaPost(input: MediaPostInput, imageFiles: File[]) {
  const upload = await uploadMediaImages(imageFiles);
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

export async function updateMediaPost(post: MediaPost, input: MediaPostInput, imageFiles: File[] = []) {
  const upload = imageFiles.length ? await uploadMediaImages(imageFiles) : { imageUrls: [] as string[], storagePaths: [] as string[], error: null };
  if (upload.error) {
    return { data: null, error: upload.error };
  }

  const existingImageUrls = post.image_urls?.length ? post.image_urls : [post.image_url].filter(Boolean);
  const existingStoragePaths = post.storage_paths?.length ? post.storage_paths : [post.storage_path].filter(Boolean) as string[];
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

export async function deleteMediaPost(post: MediaPost) {
  const storagePaths = post.storage_paths?.length ? post.storage_paths : [post.storage_path].filter(Boolean) as string[];
  if (storagePaths.length) {
    await supabase.storage.from(MEDIA_BUCKET).remove([...new Set(storagePaths)]);
  }

  const { error } = await supabase
    .from("media_posts")
    .delete()
    .eq("id", post.id);

  return { error };
}
