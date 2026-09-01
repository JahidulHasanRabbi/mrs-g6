"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SequenceImportDetail from "../../../components/admin/ui/SequenceImportDetail";
import * as adminApi from "../../../api/adminApi";

function SpinSequenceHistoryDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  if (!uuid) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-[13px] text-white/60">
        No import selected.
      </div>
    );
  }

  return (
    <SequenceImportDetail
      uuid={uuid}
      backLabel="Back to Lucky Spin"
      onBack={() => router.push("/admin/lucky-spin")}
      fetchDetail={adminApi.getLuckySpinSequenceImportDetail}
    />
  );
}

export default function LuckySpinSequenceHistoryPage() {
  return (
    <Suspense fallback={null}>
      <SpinSequenceHistoryDetail />
    </Suspense>
  );
}
