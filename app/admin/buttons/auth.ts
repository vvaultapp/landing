"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "vv_admin_buttons";
const AUTH_PASSWORD = "edredr7237";
const ONE_DAY = 60 * 60 * 24;

export async function login(formData: FormData) {
  const submitted = String(formData.get("password") || "");
  if (submitted !== AUTH_PASSWORD) {
    redirect("/admin/buttons?err=1");
  }
  const jar = await cookies();
  jar.set(AUTH_COOKIE, AUTH_PASSWORD, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_DAY,
    path: "/admin/buttons",
  });
  redirect("/admin/buttons");
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value === AUTH_PASSWORD;
}
