"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchTargetReadinessAction } from "../server/actions";
import type { TargetReadinessResult } from "@/domain/readiness";

export function useReadiness(
  initialData?: TargetReadinessResult,
  profileId?: string,
  companyId?: string
) {
  const currentProfileId = profileId || initialData?.profile.id || "general-sde";

  return useQuery({
    queryKey: [...queryKeys.readiness.overview(currentProfileId), companyId ?? "none"],
    queryFn: async () => {
      const res = await fetchTargetReadinessAction(currentProfileId, companyId);
      if (res.error || !res.data) {
        throw new Error(res.error || "Failed to load readiness data");
      }
      return res.data;
    },
    initialData:
      initialData &&
      initialData.profile.id === currentProfileId &&
      (!companyId || initialData.companyEmphasis?.id === companyId)
        ? initialData
        : undefined,
    staleTime: 60 * 1000,
  });
}
