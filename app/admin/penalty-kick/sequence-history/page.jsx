"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SequenceImportDetail from "../../../components/admin/ui/SequenceImportDetail";
import * as adminApi from "../../../api/adminApi";

function KickSequenceHistoryDetail() {
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
      backLabel="Back to Penalty Kick"
      onBack={() => router.push("/admin/penalty-kick")}
      fetchDetail={adminApi.getPenaltyKickSequenceImportDetail}
    />
  );
}

export default function PenaltyKickSequenceHistoryPage() {
  return (
    <Suspense fallback={null}>
      <KickSequenceHistoryDetail />
    </Suspense>
  );
}
