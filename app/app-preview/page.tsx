"use client";

import { AppPreview } from "@/components/features/app-preview";
import { useSimulation } from "@/lib/simulation-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppPreviewPage() {
  const { reviewStage } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    if (reviewStage !== 'done') {
      router.replace('/workspace');
    }
  }, [reviewStage, router]);

  if (reviewStage !== 'done') {
    return null;
  }

  return <AppPreview />;
}
