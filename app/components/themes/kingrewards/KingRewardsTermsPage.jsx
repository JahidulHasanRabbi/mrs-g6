"use client";

import { useRouter } from "next/navigation";
import FancyTermsConditions from "../../spin/FancyTermsConditions";
import ThemedPageShell from "../shared/ThemedPageShell";
import { PageTitle } from "./KrUi";

/** King Rewards T&C (Figma 707:3389): live-text title, Back inside the card. */
export default function KingRewardsTermsPage() {
  const router = useRouter();
  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/"));
  return (
    <ThemedPageShell>
      <div className="flex w-full flex-col items-center gap-4 px-4 pt-8">
        <PageTitle>Terms &amp; Condition</PageTitle>
        <FancyTermsConditions onBack={goBack} />
      </div>
    </ThemedPageShell>
  );
}
