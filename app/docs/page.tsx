import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "vvault Documentation | Producer Guide",
  description:
    "Complete documentation for vvault. Learn how to upload beats, send campaigns, set up sales, manage contacts, and use every producer tool.",
  alternates: { canonical: "https://get.vvault.app/docs" },

};

export default function DocsIndex() {
  redirect("/docs/introduction");
}
