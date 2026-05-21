import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminPassword } from "@/app/admin/tournament/constants";

export async function ensureAdmin(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return cookie === getAdminPassword();
}
