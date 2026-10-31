import "server-only";
import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "./tags";

/**
 * Selective Server Cache Invalidation
 * Avoids invalidating the entire application after every mutation.
 */
export async function invalidateUserToday(userId: string, date: string): Promise<void> {
  revalidateTag(CACHE_TAGS.userToday(userId, date), "max");
}

export async function invalidateUserRevision(userId: string): Promise<void> {
  revalidateTag(CACHE_TAGS.userRevision(userId), "max");
}

export async function invalidateUserProgress(userId: string): Promise<void> {
  revalidateTag(CACHE_TAGS.userProgress(userId), "max");
}

export async function invalidateProblemCatalog(problemId?: string): Promise<void> {
  if (problemId) {
    revalidateTag(CACHE_TAGS.problemDetail(problemId), "max");
  }
  revalidateTag(CACHE_TAGS.problems(), "max");
}

export async function invalidateRoadmap(topicId?: string): Promise<void> {
  if (topicId) {
    revalidateTag(CACHE_TAGS.roadmapTopic(topicId), "max");
  }
  revalidateTag(CACHE_TAGS.roadmap(), "max");
}

export async function invalidateDashboardPath(): Promise<void> {
  revalidatePath("/(dashboard)", "layout");
}
