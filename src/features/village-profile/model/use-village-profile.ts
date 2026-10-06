"use client";

import { useEffect, useState } from "react";
import type { VillageProfileDto } from "@/entities/desa/model/types";
import {
  getStoredVillageProfile,
  subscribeStoredVillageProfile,
} from "@/shared/utils/profile-storage";

export function useVillageProfile(initialProfile: VillageProfileDto | null) {
  const [profile, setProfile] = useState<VillageProfileDto | null>(initialProfile);

  // Keep state in sync with server props
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  useEffect(() => {
    // Only synchronize when admin actively updates profile in the browser session
    const syncWithStore = () => {
      const stored = getStoredVillageProfile();
      if (
        stored.headName ||
        stored.headGreeting ||
        stored.aboutText ||
        (stored.officials && stored.officials.length > 0)
      ) {
        setProfile((prev) => ({
          villageName:
            prev?.villageName ||
            initialProfile?.villageName ||
            "Desa Pringgodani",
          headGreeting:
            stored.headGreeting ||
            prev?.headGreeting ||
            initialProfile?.headGreeting ||
            "",
          headPhoto:
            stored.headPhoto ||
            prev?.headPhoto ||
            initialProfile?.headPhoto ||
            "",
          headName:
            stored.headName ||
            prev?.headName ||
            initialProfile?.headName ||
            "",
          headPosition:
            stored.headPosition ||
            prev?.headPosition ||
            initialProfile?.headPosition ||
            "",
          aboutText:
            stored.aboutText ||
            prev?.aboutText ||
            initialProfile?.aboutText ||
            "",
          officials:
            stored.officials && stored.officials.length > 0
              ? stored.officials.map((o) => ({
                  name: o.name,
                  position: o.position,
                  photo: o.photoUrl,
                  photoUrl: o.photoUrl,
                  greeting: o.greeting,
                  email: o.email,
                }))
              : prev?.officials || initialProfile?.officials || [],
        }));
      }
    };

    // Listen for real-time updates from admin changes
    const unsubscribe = subscribeStoredVillageProfile(syncWithStore);
    return () => {
      unsubscribe();
    };
  }, [initialProfile]);

  return profile || initialProfile;
}
