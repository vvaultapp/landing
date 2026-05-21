export const ADMIN_COOKIE_NAME = "vv_admin_tournament";

export function getAdminPassword(): string {
  return process.env.TOURNAMENT_ADMIN_PASSWORD || "vvtournament2026";
}
