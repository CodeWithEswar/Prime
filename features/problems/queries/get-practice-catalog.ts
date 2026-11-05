import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getMasteredProblemIds, getProblemMasteries } from "@/features/mastery/server/service";
import type {
  CatalogProblemItem,
  PracticeCatalogFilter,
  PracticeCatalogResult,
  ProblemDifficulty,
  UserProblemStatus,
  ProblemCollectionSummary,
  ProblemCompanyRelevance,
} from "../types";

/**
 * Executes an optimized PostgreSQL query for the DSA Practice catalog
 * applying server-side pagination, search, and multidimensional filters.
 */
export async function getPracticeCatalog(
  supabase: SupabaseClient<Database>,
  filters: PracticeCatalogFilter
): Promise<PracticeCatalogResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 25));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1. Handle Status Pre-Filter (via user_problem_progress)
  let statusProblemIds: string[] | null = null;
  if (filters.status && filters.userId) {
    if (filters.status === "not_started") {
      const { data: attempted } = await supabase
        .from("user_problem_progress")
        .select("problem_id")
        .eq("user_id", filters.userId)
        .neq("status", "not_started");
      const excludedIds = (attempted || []).map((r) => r.problem_id);
      if (excludedIds.length > 0) {
        // Will apply not in excludedIds
      }
    } else if (filters.status === "mastered") {
      statusProblemIds = await getMasteredProblemIds(supabase, filters.userId);
      if (!statusProblemIds.length) return { problems: [], totalCount: 0, page, pageSize, totalPages: 0 };
    } else {
      const { data: matching } = await supabase
        .from("user_problem_progress")
        .select("problem_id")
        .eq("user_id", filters.userId)
        .in("status", filters.status === "solved" ? ["solved", "mastered"] : [filters.status]);
      statusProblemIds = (matching || []).map((r) => r.problem_id);
      if (statusProblemIds.length === 0) {
        return { problems: [], totalCount: 0, page, pageSize, totalPages: 0 };
      }
    }
  }

  // 2. Handle Revision Pre-Filter (via revision_items)
  let revisionProblemIds: string[] | null = null;
  if (filters.revision && filters.userId) {
    const nowIso = new Date().toISOString();
    let revQuery = supabase
      .from("revision_items")
      .select("entity_id")
      .eq("user_id", filters.userId)
      .eq("entity_type", "problem")
      .eq("status", "active");

    if (filters.revision === "due" || filters.revision === "overdue") {
      revQuery = revQuery.lte("next_review_at", nowIso);
    }
    const { data: revMatches } = await revQuery;
    revisionProblemIds = (revMatches || []).map((r) => r.entity_id);
    if (revisionProblemIds.length === 0) {
      return { problems: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }
  }

  // 3. Construct Main Catalog Query
  const innerTopic = filters.topic ? "!inner" : "";
  const innerCollection = filters.collection ? "!inner" : "";
  const innerCompany = filters.company ? "!inner" : "";

  let query = supabase
    .from("problems")
    .select(
      `
        id,
        slug,
        title,
        difficulty,
        external_url,
        acceptance_rate,
        prime_priority,
        primary_topic:roadmap_topics!primary_topic_id${innerTopic}(id, slug, name),
        collections:problem_collection_items${innerCollection}(
          collection:problem_collections${innerCollection}(id, slug, name)
        )
        ${
          filters.company
            ? `, company_stats:company_problem_stats${innerCompany}(
                time_window,
                frequency,
                company:companies${innerCompany}(id, slug, name)
              )`
            : ""
        }
      `,
      { count: "exact" }
    )
    .eq("is_active", true);

  // Apply Search
  if (filters.q?.trim()) {
    query = query.ilike("title", `%${filters.q.trim()}%`);
  }

  // Apply Difficulty Filter
  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  // Apply Topic Filter
  if (filters.topic) {
    query = query.eq("primary_topic.slug", filters.topic);
  }

  // Apply Collection Filter
  if (filters.collection) {
    query = query.eq("collections.collection.slug", filters.collection);
  }

  // Apply Company Filter
  if (filters.company) {
    query = query.eq("company_stats.company.slug", filters.company);
    if (filters.window) {
      query = query.eq("company_stats.time_window", filters.window);
    }
  }

  // Apply Status Problem IDs
  if (statusProblemIds !== null) {
    query = query.in("id", statusProblemIds);
  } else if (filters.status === "not_started" && filters.userId) {
    const { data: attempted } = await supabase
      .from("user_problem_progress")
      .select("problem_id")
      .eq("user_id", filters.userId)
      .neq("status", "not_started");
    const excludedIds = (attempted || []).map((r) => r.problem_id);
    if (excludedIds.length > 0) {
      query = query.not("id", "in", `(${excludedIds.join(",")})`);
    }
  }

  // Apply Revision Problem IDs
  if (revisionProblemIds !== null) {
    query = query.in("id", revisionProblemIds);
  }

  // Apply Sorting
  switch (filters.sort) {
    case "difficulty_asc":
      query = query.order("difficulty", { ascending: true }).order("title", { ascending: true });
      break;
    case "difficulty_desc":
      query = query.order("difficulty", { ascending: false }).order("title", { ascending: true });
      break;
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    case "recommended":
    default:
      query = query
        .order("prime_priority", { ascending: true })
        .order("title", { ascending: true });
      break;
  }

  // Apply Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error("❌ Failed to query practice catalog:", error);
    throw new Error(`Catalog query failed: ${error.message}`);
  }

  const rawProblems: any[] = (data as any[]) || [];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 4. Merge Personal User Progress & Revision State (Batch O(1) merge)
  const problemIds = rawProblems.map((p) => p.id as string);
  const userProgressMap = new Map<string, { status: UserProblemStatus; lastAttemptAt: string | null; nextRevisionAt: string | null }>();
  const mastery = filters.userId && problemIds.length ? getProblemMasteries(supabase, filters.userId, problemIds).catch(() => null) : Promise.resolve(null);
  const revisionDueSet = new Set<string>();
  const revisionOverdueSet = new Set<string>();

  if (filters.userId && problemIds.length > 0) {
    const nowTime = Date.now();
    const [progressRes, revisionRes] = await Promise.all([
      supabase
        .from("user_problem_progress")
        .select("problem_id, status, last_attempt_at, next_revision_at")
        .eq("user_id", filters.userId)
        .in("problem_id", problemIds),
      supabase
        .from("revision_items")
        .select("entity_id, next_review_at")
        .eq("user_id", filters.userId)
        .eq("entity_type", "problem")
        .eq("status", "active")
        .in("entity_id", problemIds),
    ]);

    if (progressRes.data) {
      for (const row of progressRes.data) {
        userProgressMap.set(row.problem_id, {
          status: row.status === "mastered" ? "solved" : (row.status as UserProblemStatus) || "not_started",
          lastAttemptAt: row.last_attempt_at,
          nextRevisionAt: row.next_revision_at,
        });
      }
    }

    if (revisionRes.data) {
      for (const rev of revisionRes.data) {
        if (rev.next_review_at) {
          const revTime = new Date(rev.next_review_at).getTime();
          if (revTime <= nowTime) {
            revisionDueSet.add(rev.entity_id);
            // Overdue if > 24 hours past due
            if (nowTime - revTime > 86400000) {
              revisionOverdueSet.add(rev.entity_id);
            }
          }
        }
      }
    }
  }

  // 5. Transform into typed CatalogProblemItem
  const evidence = await mastery;
  const problems: CatalogProblemItem[] = rawProblems.map((p: any) => {
    const progress = userProgressMap.get(p.id);
    const collectionsList: ProblemCollectionSummary[] = (p.collections || [])
      .map((c: any) => c.collection)
      .filter(Boolean);

    let companyRel: ProblemCompanyRelevance | null = null;
    if (p.company_stats && p.company_stats.length > 0) {
      const stat = p.company_stats[0];
      if (stat?.company) {
        companyRel = {
          companySlug: stat.company.slug,
          companyName: stat.company.name,
          frequency: Number(stat.frequency || 0),
          timeWindow: stat.time_window,
        };
      }
    }

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty as ProblemDifficulty,
      externalUrl: p.external_url,
      acceptanceRate: p.acceptance_rate ? Number(p.acceptance_rate) : null,
      primePriority: p.prime_priority || "standard",
      primaryTopic: p.primary_topic || null,
      collectionCount: collectionsList.length,
      collections: collectionsList,
      companyRelevance: companyRel,
      status: progress?.status || "not_started",
      lastAttemptAt: progress?.lastAttemptAt || null,
      nextRevisionAt: progress?.nextRevisionAt || null,
      isRevisionDue: revisionDueSet.has(p.id),
      isRevisionOverdue: revisionOverdueSet.has(p.id),
      masteryScore: (evidence?.get(p.id)?.score ?? 0) / 100,
      masteryLevel: evidence?.get(p.id)?.level,
    };
  });

  return {
    problems,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
