import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppearancePreferences } from "./get-appearance";

import { createClient } from "@/lib/supabase/server";
import type {
  SettingsOverviewData,
  UserProfileExtended,
  CareerTargets,
  StudyCommitment,
  LearningPreferences,
  AppearancePreferences,
  AccountSecuritySummary,
  WeekdayAvailabilityItem,
} from "../types";

export const getSettingsOverview = cache(
  async (
    section:
      | "overview"
      | "profile"
      | "targets"
      | "study"
      | "learning"
      | "appearance"
      | "security"
      | "connections" = "overview"
  ): Promise<SettingsOverviewData | null> => {
    const supabase: SupabaseClient = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const empty = Promise.resolve({ data: null, error: null });
    // Load only the records used by the active section.
    const [
      profileRes,
      settingsRes,
      rulesRes,
      learningRes,
      appearanceRes,
      notifRes,
      securityEventsRes,
    ] = await Promise.all([
      ["overview", "profile"].includes(section)
        ? supabase
            .from("profiles")
            .select(
              "id,display_name,full_name,avatar_url,institution,degree,specialization,graduation_year,created_at,updated_at"
            )
            .eq("id", user.id)
            .maybeSingle()
        : empty,
      ["overview", "targets", "study"].includes(section)
        ? supabase
            .from("user_settings")
            .select(
              "target_role,target_companies,primary_target_company,target_package,target_compensation_amount,target_compensation_currency,target_compensation_period,min_acceptable_compensation,target_date,start_date,daily_study_minutes,experience_level,difficulty_preference,rest_days,timezone"
            )
            .eq("user_id", user.id)
            .maybeSingle()
        : empty,
      section === "study"
        ? supabase
            .from("availability_rules")
            .select(
              "day_of_week,available_minutes,is_rest_day,preferred_start_time,preferred_end_time"
            )
            .eq("user_id", user.id)
            .order("day_of_week", { ascending: true })
        : empty,
      ["overview", "learning"].includes(section)
        ? supabase
            .from("user_learning_preferences")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle()
        : empty,
      section === "appearance"
        ? getAppearancePreferences(user.id)
        : Promise.resolve(null),
      section === "overview"
        ? supabase
            .from("notification_preferences")
            .select("in_app_enabled,email_enabled")
            .eq("user_id", user.id)
            .maybeSingle()
        : empty,
      section === "security"
        ? supabase
            .from("account_security_events")
            .select("id,event_type,ip_address,user_agent,metadata,created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5)
        : empty,
    ]);

    for (const result of [
      profileRes,
      settingsRes,
      rulesRes,
      learningRes,
      notifRes,
      securityEventsRes,
    ]) {
      if (result.error)
        throw new Error("Settings could not be loaded. Try again shortly.");
    }

    // 2. Assemble Profile
    const rawProf = profileRes.data;
    const profile: UserProfileExtended = {
      id: user.id,
      email: user.email ?? "",
      displayName:
        rawProf?.display_name ?? user.user_metadata?.full_name ?? "PRIME Member",
      fullName: rawProf?.full_name ?? user.user_metadata?.full_name ?? null,
      avatarUrl: rawProf?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      institution: rawProf?.institution ?? null,
      degree: rawProf?.degree ?? null,
      specialization: rawProf?.specialization ?? null,
      graduationYear: rawProf?.graduation_year ?? null,
      createdAt: rawProf?.created_at ?? user.created_at,
      updatedAt: rawProf?.updated_at ?? user.updated_at ?? user.created_at,
    };

    // 3. Assemble Career Targets
    const rawSet = settingsRes.data;
    const targets: CareerTargets = {
      targetRole: rawSet?.target_role ?? "",
      targetCompanies: Array.isArray(rawSet?.target_companies)
        ? rawSet.target_companies
        : [],
      primaryTargetCompany: rawSet?.primary_target_company ?? null,
      targetPackage: rawSet?.target_package ?? null,
      targetCompensationAmount: rawSet?.target_compensation_amount
        ? Number(rawSet.target_compensation_amount)
        : null,
      targetCompensationCurrency: rawSet?.target_compensation_currency ?? "INR",
      targetCompensationPeriod:
        rawSet?.target_compensation_period === "monthly" ? "monthly" : "annual",
      minAcceptableCompensation: rawSet?.min_acceptable_compensation
        ? Number(rawSet.min_acceptable_compensation)
        : null,
      targetDate: rawSet?.target_date ?? null,
      startDate: rawSet?.start_date ?? new Date().toISOString().split("T")[0],
      experienceLevel: rawSet?.experience_level ?? "intermediate",
      difficultyPreference: rawSet?.difficulty_preference ?? "balanced",
    };

    // 4. Assemble Study Commitment
    const dailyStudyMinutes = rawSet?.daily_study_minutes ?? 120;
    const restDays: number[] = Array.isArray(rawSet?.rest_days) ? rawSet.rest_days : [];

    const existingRules: WeekdayAvailabilityItem[] = (rulesRes.data ?? []).map(
      (r: {
        day_of_week: number;
        available_minutes: number;
        is_rest_day: boolean;
        preferred_start_time: string | null;
        preferred_end_time: string | null;
      }) => ({
        dayOfWeek: r.day_of_week,
        availableMinutes: r.available_minutes,
        isRestDay: r.is_rest_day,
        preferredStartTime: r.preferred_start_time,
        preferredEndTime: r.preferred_end_time,
      })
    );

    // Build full 7-day rules map (0 to 6)
    const fullRules: WeekdayAvailabilityItem[] = Array.from(
      { length: 7 },
      (_, dayIndex) => {
        const found = existingRules.find((r) => r.dayOfWeek === dayIndex);
        if (found) return found;
        const isRest = restDays.includes(dayIndex);
        return {
          dayOfWeek: dayIndex,
          availableMinutes: isRest ? 0 : dailyStudyMinutes,
          isRestDay: isRest,
          preferredStartTime: null,
          preferredEndTime: null,
        };
      }
    );

    const weeklyCapacityMinutes = fullRules.reduce(
      (sum, r) => sum + (r.isRestDay ? 0 : r.availableMinutes),
      0
    );
    const activeDaysCount = fullRules.filter((rule) => !rule.isRestDay).length;
    const weeklyTargetMinutes = dailyStudyMinutes * activeDaysCount;
    const feasibilityRatio =
      weeklyCapacityMinutes > 0 ? weeklyTargetMinutes / weeklyCapacityMinutes : 1;

    const study: StudyCommitment = {
      dailyStudyMinutes,
      restDays,
      weeklyCapacityMinutes,
      weeklyTargetMinutes,
      availabilityRules: fullRules,
      feasibilityRatio,
      isFeasible: weeklyTargetMinutes <= weeklyCapacityMinutes,
    };

    // 5. Assemble Learning Preferences
    const rawLearn = learningRes.data;
    const learning: LearningPreferences = {
      preferredLanguage: rawLearn?.preferred_language ?? "java",
      difficultyLevel: rawLearn?.difficulty_level ?? "intermediate",
      learningPace: rawLearn?.learning_pace ?? "standard",
      defaultSessionMinutes: rawLearn?.default_session_minutes ?? 60,
      revisionMode: rawLearn?.revision_mode ?? "adaptive",
      instructionalLanguage: rawLearn?.instructional_language ?? "english",
      videoPlayerMode: rawLearn?.video_player_mode ?? "embedded",
      showSupplementaryLessons: rawLearn?.show_supplementary_lessons ?? true,
      enableAptitudeModule: rawLearn?.enable_aptitude_module ?? true,
      aptitudeTrackFocus: rawLearn?.aptitude_track_focus ?? "comprehensive",
      aptitudeDailyTargetMinutes: rawLearn?.aptitude_daily_target_minutes ?? 30,
    };

    // 6. Assemble Appearance Preferences
    const appearance: AppearancePreferences = appearanceRes ?? {
      theme: "dark",
      motionPreference: "system",
      uiDensity: "comfortable",
      fontScaling: "normal",
    };
    // 7. Assemble Security Summary
    const rawIdentities = user.identities ?? [];
    const providers = Array.from(new Set(rawIdentities.map((i) => i.provider)));
    if (providers.length === 0 && user.app_metadata?.provider) {
      providers.push(user.app_metadata.provider);
    }

    const security: AccountSecuritySummary = {
      email: user.email ?? "",
      emailConfirmed: Boolean(user.email_confirmed_at),
      providers,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      recentSecurityEvents: (securityEventsRes.data ?? []).map(
        (e: {
          id: string;
          event_type: string;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        }) => ({
          id: e.id,
          eventType: e.event_type,
          ipAddress: e.ip_address,
          userAgent: e.user_agent,
          metadata: e.metadata ?? {},
          createdAt: e.created_at,
        })
      ),
    };

    return {
      profile,
      targets,
      study,
      learning,
      appearance,
      notificationsEnabled: Boolean(
        notifRes.data?.in_app_enabled || notifRes.data?.email_enabled
      ),
      security,
    };
  }
);
