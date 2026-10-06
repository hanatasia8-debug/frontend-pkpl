import { HomePage } from "@/views/home/home-page";

/**
 * Lives in its own `(home)` route group (instead of directly at
 * `app/(public)/page.tsx`) purely so `loading.tsx` can sit next to it and
 * scope its Suspense boundary to just `/` — see `loading.tsx` in this same
 * folder, and `berita/(list)/loading.tsx` for why a shared boundary with
 * sibling routes is avoided elsewhere in this app.
 */
export const dynamic = "force-dynamic";

export default function Page() {
  return <HomePage />;
}
