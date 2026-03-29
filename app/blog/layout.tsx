import { BlogNav, BlogFooter, BottomCta } from "@/components/blog/BlogShell";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-[#f0f0f0]">
      <BlogNav />
      <main className="mx-auto max-w-[720px] px-5 pt-28 pb-20 sm:px-8">
        {children}
      </main>
      <BottomCta />
      <BlogFooter />
    </div>
  );
}
