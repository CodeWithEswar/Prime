import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  userSettingsSchema,
  userProfileSchema,
} from "../../features/settings/schema";
import {
  dailyPlanSchema,
  dailyTaskSchema,
} from "../../features/daily-plan/schema";
import {
  problemSchema,
  problemAttemptSchema,
  userProblemProgressSchema,
} from "../../features/problems/schema";
import {
  revisionItemSchema,
  revisionAttemptSchema,
} from "../../features/revision/schema";
import { roadmapTopicSchema } from "../../features/roadmap/schema";

describe("Database Schema & Row Level Security (RLS) Architecture", () => {
  const migrationPath = path.resolve(
    __dirname,
    "../../supabase/migrations/20261031180218_schema_and_rls.sql"
  );
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  describe("Row Level Security Policy Enforcement in Migrations", () => {
    const requiredTables = [
      "roadmap_topics",
      "roadmap_dependencies",
      "problems",
      "problem_topics",
      "companies",
      "company_problem_stats",
      "profiles",
      "user_settings",
      "daily_plans",
      "daily_tasks",
      "problem_attempts",
      "user_problem_progress",
      "revision_items",
      "revision_attempts",
      "study_sessions",
      "progress_snapshots",
      "notes",
    ];

    it("explicitly enables RLS on all 16 database tables", () => {
      for (const table of requiredTables) {
        const rlsStatement = `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`;
        expect(
          migrationSql.includes(rlsStatement),
          `Expected table ${table} to have RLS enabled`
        ).toBe(true);
      }
    });

    it("restricts global catalog tables to read-only access for anon and authenticated users", () => {
      const catalogTables = [
        "roadmap_topics",
        "roadmap_dependencies",
        "problems",
        "problem_topics",
        "companies",
        "company_problem_stats",
      ];

      for (const table of catalogTables) {
        expect(
          migrationSql.includes(
            `CREATE POLICY "${table}_select" ON public.${table}`
          ),
          `Expected SELECT policy for catalog table ${table}`
        ).toBe(true);

        // Catalog tables must NOT have public INSERT/UPDATE/DELETE policies
        expect(
          migrationSql.includes(`CREATE POLICY "${table}_insert"`),
          `Catalog table ${table} must not have public insert policy`
        ).toBe(false);
        expect(
          migrationSql.includes(`CREATE POLICY "${table}_update"`),
          `Catalog table ${table} must not have public update policy`
        ).toBe(false);
        expect(
          migrationSql.includes(`CREATE POLICY "${table}_delete"`),
          `Catalog table ${table} must not have public delete policy`
        ).toBe(false);
      }
    });

    it("strictly isolates user-owned tables with auth.uid() checks", () => {
      const userOwnedPolicies = [
        "profiles_select_own",
        "profiles_update_own",
        "user_settings_select_own",
        "user_settings_insert_own",
        "user_settings_update_own",
        "daily_plans_select_own",
        "daily_plans_insert_own",
        "daily_plans_update_own",
        "daily_plans_delete_own",
        "daily_tasks_select_own",
        "daily_tasks_insert_own",
        "daily_tasks_update_own",
        "daily_tasks_delete_own",
        "problem_attempts_select_own",
        "problem_attempts_insert_own",
        "user_problem_progress_select_own",
        "revision_items_select_own",
        "revision_items_insert_own",
        "revision_items_update_own",
        "revision_items_delete_own",
        "study_sessions_select_own",
        "progress_snapshots_select_own",
        "notes_select_own",
      ];

      for (const policy of userOwnedPolicies) {
        expect(
          migrationSql.includes(`CREATE POLICY "${policy}"`),
          `Expected user isolation policy ${policy} to exist`
        ).toBe(true);
      }

      // Check auth.uid() is wrapped in subselect for planner caching optimization
      expect(migrationSql.includes("(select auth.uid())")).toBe(true);
    });

    it("configures safe foreign key deletion constraints (CASCADE vs RESTRICT)", () => {
      // Problem attempts must NOT cascade-delete canonical problems
      expect(
        migrationSql.includes(
          "REFERENCES public.problems(id) ON DELETE RESTRICT"
        )
      ).toBe(true);

      // User data MUST cascade-delete when auth.users is deleted
      expect(
        migrationSql.includes("REFERENCES auth.users(id) ON DELETE CASCADE")
      ).toBe(true);
    });
  });

  describe("Domain & Entity Zod Schema Validation", () => {
    const validUuid = "11111111-2222-4333-a444-555555555555";
    const validDate = "2026-10-31";
    const validTimestamp = new Date().toISOString();

    it("validates and defaults UserSettings correctly", () => {
      const parsedProfile = userProfileSchema.parse({
        id: validUuid,
        display_name: "Test Engineer",
        avatar_url: "https://example.com/avatar.png",
        created_at: validTimestamp,
        updated_at: validTimestamp,
      });
      expect(parsedProfile.display_name).toBe("Test Engineer");

      const parsed = userSettingsSchema.parse({
        user_id: validUuid,
        start_date: validDate,
      });

      expect(parsed.target_role).toBe("Software Engineer");
      expect(parsed.daily_study_minutes).toBe(120);
      expect(parsed.experience_level).toBe("intermediate");
      expect(parsed.difficulty_preference).toBe("balanced");
      expect(parsed.morning_email_enabled).toBe(true);
      expect(parsed.rest_days).toEqual([]);
    });

    it("rejects invalid UserSettings (e.g., non-positive study minutes or malformed date)", () => {
      expect(() =>
        userSettingsSchema.parse({
          user_id: validUuid,
          start_date: "invalid-date",
          daily_study_minutes: -10,
        })
      ).toThrow();
    });

    it("validates DailyPlan and DailyTask schemas", () => {
      const plan = dailyPlanSchema.parse({
        id: validUuid,
        user_id: validUuid,
        plan_date: validDate,
        day_number: 1,
        created_at: validTimestamp,
        updated_at: validTimestamp,
      });
      expect(plan.status).toBe("in_progress");
      expect(plan.planned_minutes).toBe(0);

      const task = dailyTaskSchema.parse({
        id: validUuid,
        daily_plan_id: validUuid,
        user_id: validUuid,
        task_type: "practice",
        title: "Solve Two Sum",
        created_at: validTimestamp,
        updated_at: validTimestamp,
      });
      expect(task.status).toBe("pending");
      expect(task.planned_minutes).toBe(30);
      expect(task.source).toBe("planner");
    });

    it("validates Problem and ProblemAttempt schemas with confidence bounds", () => {
      const problem = problemSchema.parse({
        id: validUuid,
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "easy",
        acceptance_rate: 52.4,
        created_at: validTimestamp,
        updated_at: validTimestamp,
      });
      expect(problem.difficulty).toBe("easy");
      expect(problem.is_active).toBe(true);

      const attempt = problemAttemptSchema.parse({
        id: validUuid,
        user_id: validUuid,
        problem_id: validUuid,
        outcome: "independent",
        time_taken_seconds: 480,
        confidence: 4,
        attempted_at: validTimestamp,
        created_at: validTimestamp,
      });
      expect(attempt.confidence).toBe(4);

      const progress = userProblemProgressSchema.parse({
        user_id: validUuid,
        problem_id: validUuid,
        status: "attempted",
        mastery_score: 0.75,
        updated_at: validTimestamp,
      });
      expect(progress.status).toBe("attempted");
      expect(progress.mastery_score).toBe(0.75);

      // Out of bounds confidence (1-5 only)
      expect(() =>
        problemAttemptSchema.parse({
          id: validUuid,
          user_id: validUuid,
          problem_id: validUuid,
          outcome: "independent",
          confidence: 7, // Invalid!
          attempted_at: validTimestamp,
          created_at: validTimestamp,
        })
      ).toThrow();
    });

    it("validates RevisionItem and RevisionAttempt schemas", () => {
      const revItem = revisionItemSchema.parse({
        id: validUuid,
        user_id: validUuid,
        entity_type: "problem",
        entity_id: validUuid,
        next_review_at: validTimestamp,
        created_at: validTimestamp,
        updated_at: validTimestamp,
      });
      expect(revItem.interval_days).toBe(1);
      expect(revItem.status).toBe("active");

      const revAttempt = revisionAttemptSchema.parse({
        id: validUuid,
        revision_item_id: validUuid,
        user_id: validUuid,
        rating: "easy",
        previous_interval_days: 1,
        next_interval_days: 3,
        reviewed_at: validTimestamp,
        created_at: validTimestamp,
      });
      expect(revAttempt.rating).toBe("easy");
      expect(revAttempt.next_interval_days).toBe(3);
    });

    it("validates RoadmapTopic schema", () => {
      const topic = roadmapTopicSchema.parse({
        id: validUuid,
        slug: "binary-search",
        name: "Binary Search",
        domain: "dsa",
        description: "Divide and conquer search pattern",
        sort_order: 7,
        estimated_minutes: 90,
        is_active: true,
        created_at: validTimestamp,
        updated_at: validTimestamp,
      });
      expect(topic.domain).toBe("dsa");
      expect(topic.estimated_minutes).toBe(90);
    });
  });

  describe("Mastery Engine Migration RLS & Security Architecture", () => {
    const masteryMigrationPath = path.resolve(
      __dirname,
      "../../supabase/migrations/20261103040000_mastery_engine.sql"
    );
    const sql = fs.readFileSync(masteryMigrationPath, "utf-8");

    it("explicitly enables RLS on user_problem_mastery", () => {
      expect(sql).toContain("ALTER TABLE public.user_problem_mastery ENABLE ROW LEVEL SECURITY;");
    });

    it("enforces user isolation policies for SELECT, INSERT, UPDATE, DELETE", () => {
      expect(sql).toContain('CREATE POLICY "user_problem_mastery_select_own" ON public.user_problem_mastery');
      expect(sql).toContain('CREATE POLICY "user_problem_mastery_insert_own" ON public.user_problem_mastery');
      expect(sql).toContain('CREATE POLICY "user_problem_mastery_update_own" ON public.user_problem_mastery');
      expect(sql).toContain('CREATE POLICY "user_problem_mastery_delete_own" ON public.user_problem_mastery');
      expect(sql).toContain("(select auth.uid()) = user_id");
    });

    it("creates unique constraint on (user_id, problem_id, policy_version)", () => {
      expect(sql).toContain("CONSTRAINT unique_user_problem_policy UNIQUE (user_id, problem_id, policy_version)");
    });

    it("creates lookup indexes on user_id, problem_id, and level", () => {
      expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_user_problem_mastery_user_problem");
      expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_user_problem_mastery_user_level");
    });
  });
});
