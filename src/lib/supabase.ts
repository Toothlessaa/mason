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
