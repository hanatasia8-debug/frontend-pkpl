import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

/** Breadcrumb from the detail prototype: UMKM › <nama usaha>. */
export function UmkmBreadcrumb({ name }: { name: string }) {
  return (
    <nav
      className="text-on-surface-variant font-label-sm text-label-sm mb-8 flex items-center gap-2"
      aria-label="Breadcrumb"
    >
      <Link href="/umkm" className="hover:text-primary transition-colors">
        UMKM
      </Link>
      <Icon name="chevron_right" className="text-[16px]" />
      <span className="text-on-surface font-semibold">{name}</span>
    </nav>
  );
}
