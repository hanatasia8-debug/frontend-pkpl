"use client";

import { useEffect } from "react";
import { useKknEasterEgg } from "../model/use-kkn-easter-egg";
import { Kkn3dCarouselModal } from "./kkn-3d-carousel-modal";
import { initConsoleCredits } from "@/shared/utils/console-credits";

export function KknMemorialProvider() {
  const { isOpen, close } = useKknEasterEgg();

  useEffect(() => {
    initConsoleCredits();
  }, []);

  return <Kkn3dCarouselModal isOpen={isOpen} onClose={close} />;
}
