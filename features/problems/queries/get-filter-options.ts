import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ProblemTopicSummary, ProblemCollectionSummary } from "../types";

export interface CompanyFilterOption {
  id: string;
  slug: string;
  name: string;
  problemCount?: number;
}

export interface FilterOptionsData {
  topics: ProblemTopicSummary[];
  collections: ProblemCollectionSummary[];
  companies: CompanyFilterOption[];
}

/**
 * Fetches canonical taxonomies, collections, and top companies for filtering.
 */
export async function getFilterOptions(
  supabase: SupabaseClient<Database>
): Promise<FilterOptionsData> {
  const [topicsRes, collectionsRes, companiesRes] = await Promise.all([
    supabase
      .from("roadmap_topics")
      .select("id, slug, name, problems!primary_topic_id(count)")
      .eq("domain", "dsa")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("problem_collections")
      .select("id, slug, name, problem_collection_items(count)")
      .eq("is_active", true)
      .order("name", { ascending: true }),

    supabase
      .from("companies")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(100),
  ]);

  const topics: ProblemTopicSummary[] = ((topicsRes.data || []) as any[]).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    problemCount: t.problems?.[0]?.count ?? undefined,
  }));

  const collections: ProblemCollectionSummary[] = ((collectionsRes.data || []) as any[]).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    problemCount: c.problem_collection_items?.[0]?.count ?? undefined,
  }));

  return {
    topics,
    collections,
    companies: (companiesRes.data || []) as CompanyFilterOption[],
  };
}

