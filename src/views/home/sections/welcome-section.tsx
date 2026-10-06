"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import type { VillageProfileDto } from "@/entities/desa/model/types";
import { useVillageProfile } from "@/features/village-profile/model/use-village-profile";

interface WelcomeSectionProps {
  profile: VillageProfileDto | null;
}

export function WelcomeSection({
  profile: initialProfile,
}: WelcomeSectionProps) {
  const profile = useVillageProfile(initialProfile);
  if (!profile) {
    return (
      <section className="max-w-container-max px-gutter py-16 mx-auto text-center">
        <p className="text-on-surface-variant text-sm">
          Profil desa belum tersedia.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-container-max px-gutter mx-auto py-20">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12">
        {/* Photo Card with subtle elevation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5"
        >
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant/30 shadow-xl bg-surface-container">
            <FallbackImage
              src={profile.headPhoto}
              alt={profile.headName ?? "Kepala Desa"}
              className="aspect-[4/5] w-full object-cover"
              fallbackIcon="person"
            />
            {profile.headName && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                <p className="font-headline-md text-lg font-bold">
                  {profile.headName}
                </p>
                <p className="text-xs text-white/80 mt-0.5">
                  {profile.headPosition ?? "Kepala Desa Pringgodani"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Greeting & Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="md:col-span-7 space-y-6"
        >
          <div>
            <span className="bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold">
              <Icon name="verified" className="text-sm" />
              Pemerintah Desa Pringgodani
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight">
              Membangun Kemandirian Ekonomi &amp; Wirausaha Warga
            </h2>
          </div>

          <blockquote className="border-l-4 border-primary bg-surface-container-low rounded-r-2xl p-5 text-on-surface leading-relaxed italic text-sm md:text-base">
            &ldquo;{profile.headGreeting}&rdquo;
          </blockquote>

          <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
            Platform <strong>Lokal Pringgodani</strong> hadir sebagai wadah resmi promosi produk olahan, sentra kerajinan, dan hasil bumi warga desa agar semakin dikenal dan terhubung langsung ke pembeli.
          </p>

          <div>
            <Link
              href="/profil"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <span>Profil Desa &amp; Perangkat Lengkap</span>
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
