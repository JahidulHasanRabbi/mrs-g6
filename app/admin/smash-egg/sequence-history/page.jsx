"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SequenceImportDetail from "../../../components/admin/ui/SequenceImportDetail";
import * as adminApi from "../../../api/adminApi";

function SmashSequenceHistoryDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  if (!uuid) {
    return (
      <div className="rounded-[16px] bg-[#041502] p-6 text-center text-[13px] text-white/60 shadow-[0_-4px_12px_-2px_#dea220]">
        No import selected.
      </div>
    );
  }

  return (
    <SequenceImportDetail
      uuid={uuid}
      backLabel="Back to Smash Egg"
      onBack={() => router.push("/admin/smash-egg")}
      fetchDetail={adminApi.getSmashEggSequenceImportDetail}
    />
  );
}

export default function SmashEggSequenceHistoryPage() {
  return (
    <Suspense fallback={null}>
      <SmashSequenceHistoryDetail />
    </Suspense>
  );
}
