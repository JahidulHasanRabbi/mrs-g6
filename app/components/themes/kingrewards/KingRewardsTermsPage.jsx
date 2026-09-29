"use client";

import { useRouter, useSearchParams } from "next/navigation";
import FancyTermsConditions from "../../spin/FancyTermsConditions";
import ThemedPageShell from "../shared/ThemedPageShell";
import { PageTitle } from "./KrUi";

/** King Rewards T&C (Figma 707:3389): live-text title, Back inside the card. */
export default function KingRewardsTermsPage() {
  const router = useRouter();
  const from = useSearchParams().get("from");
  // Return to the page or game whose "!" opened the rules.
  const goBack = () => (/^\/(?!\/)/.test(from || "") ? router.push(from) : window.history.length > 1 ? router.back() : router.push("/"));
  return (
    <ThemedPageShell>
      <div className="flex w-full flex-col items-center gap-4 px-4 pt-8">
        <PageTitle>Terms &amp; Conditions</PageTitle>
        <FancyTermsConditions onBack={goBack} />
      </div>
    </ThemedPageShell>
  );
}
