"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminPassword } from "./constants";

const ONE_DAY = 60 * 60 * 24;

export async function login(formData: FormData) {
  const submitted = String(formData.get("password") || "");
  const expected = getAdminPassword();
  if (submitted !== expected) {
    redirect("/admin/tournament?err=1");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_DAY,
    path: "/",
  });
  redirect("/admin/tournament");
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE_NAME)?.value === getAdminPassword();
}

export async function isAuthedFromCookieHeader(header: string | null): Promise<boolean> {
  if (!header) return false;
  const match = header.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
  return match?.[1] === getAdminPassword();
}
