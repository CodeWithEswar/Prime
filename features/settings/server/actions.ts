"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  profileUpdateSchema,
  careerTargetsUpdateSchema,
  studyCommitmentUpdateSchema,
  learningPreferencesUpdateSchema,
  appearancePreferencesUpdateSchema,
  accountDeletionSchema,
  emailChangeSchema,
} from "../schema";

async function executeAuthAction<T>(
  run: (userId: string, client: SupabaseClient, user: User) => Promise<T>
) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return { ok: false as const, error: "Authentication required to update settings" };
    }

    const data = await run(user.id, client, user);
    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    revalidatePath("/settings/targets");
    revalidatePath("/settings/study");
    revalidatePath("/settings/learning");
    revalidatePath("/settings/appearance");
    revalidatePath("/settings/security");
    revalidatePath("/settings/privacy");
    revalidatePath("/today");
    revalidatePath("/roadmap");
    revalidatePath("/plan");
    revalidatePath("/calendar");
    return { ok: true as const, data };
  } catch (error) {
    console.error("[Settings] Server action error:", error);
    return {
      ok: false as const,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Check the fields and try again.")
          : error instanceof Error
            ? error.message
            : "Could not save changes. Try again.",
    };
  }
}

/**
 * 1. Update Personal Profile Information
 */
export async function updateProfileAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client, user) => {
    const parsed = profileUpdateSchema.parse(rawInput);

    const { data, error } = await client
      .from("profiles")
      .upsert(
        {
          id: userId,
          display_name: parsed.displayName,
          full_name: parsed.fullName || null,
          avatar_url: parsed.avatarUrl || null,
          institution: parsed.institution || null,
          degree: parsed.degree || null,
          specialization: parsed.specialization || null,
          graduation_year: parsed.graduationYear || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;
    const identity: Record<string, string | null> = {
      full_name: parsed.fullName || parsed.displayName,
    };
    if (
      parsed.avatarUrl !== undefined &&
      parsed.avatarUrl !== user.user_metadata?.avatar_url
    ) {
      identity.avatar_url = parsed.avatarUrl || null;
      identity.picture = parsed.avatarUrl || null;
    }
    const { error: identityError } = await client.auth.updateUser({ data: identity });
    if (identityError)
      throw new Error(
        "Your profile was saved, but the account display could not be updated. Save again to retry."
      );
    revalidatePath("/", "layout");
    return data;
  });
}

/**
 * 2. Update Placement Targets & Career Goals
 */
export async function updateCareerTargetsAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client) => {
    const parsed = careerTargetsUpdateSchema.parse(rawInput);

    const { data, error } = await client
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          target_role: parsed.targetRole,
          target_companies: parsed.targetCompanies,
          primary_target_company: parsed.primaryTargetCompany || null,
          target_package: parsed.targetPackage || null,
          target_compensation_amount: parsed.targetCompensationAmount || null,
          target_compensation_currency: parsed.targetCompensationCurrency,
          target_compensation_period: parsed.targetCompensationPeriod,
          min_acceptable_compensation: parsed.minAcceptableCompensation || null,
          target_date: parsed.targetDate || null,
          experience_level: parsed.experienceLevel,
          difficulty_preference: parsed.difficultyPreference,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

/**
 * 3. Update Study Commitment & Weekly Availability Rules
 */
export async function updateStudyCommitmentAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client) => {
    const parsed = studyCommitmentUpdateSchema.parse(rawInput);

    // 1. Update user_settings daily study duration & rest days
    const { error: settingsError } = await client
      .from("user_settings")
      .update({
        daily_study_minutes: parsed.dailyStudyMinutes,
        rest_days: parsed.restDays,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (settingsError) throw settingsError;

    // 2. Upsert each of the 7 weekday availability rules
    const now = new Date().toISOString();
    const rows = parsed.availabilityRules.map((r) => ({
      user_id: userId,
      day_of_week: r.dayOfWeek,
      available_minutes: r.isRestDay ? 0 : r.availableMinutes,
      is_rest_day: r.isRestDay,
      preferred_start_time: r.preferredStartTime || null,
      preferred_end_time: r.preferredEndTime || null,
      updated_at: now,
    }));

    const { error: rulesError } = await client
      .from("availability_rules")
      .upsert(rows, { onConflict: "user_id, day_of_week" });

    if (rulesError) throw rulesError;

    return { success: true };
  });
}

/**
 * 4. Update Learning Preferences
 */
export async function updateLearningPreferencesAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client) => {
    const parsed = learningPreferencesUpdateSchema.parse(rawInput);

    const { data, error } = await client
      .from("user_learning_preferences")
      .upsert(
        {
          user_id: userId,
          preferred_language: parsed.preferredLanguage,
          difficulty_level: parsed.difficultyLevel,
          learning_pace: parsed.learningPace,
          default_session_minutes: parsed.defaultSessionMinutes,
          revision_mode: parsed.revisionMode,
          instructional_language: parsed.instructionalLanguage,
          video_player_mode: parsed.videoPlayerMode,
          show_supplementary_lessons: parsed.showSupplementaryLessons,
          enable_aptitude_module: parsed.enableAptitudeModule,
          aptitude_track_focus: parsed.aptitudeTrackFocus,
          aptitude_daily_target_minutes: parsed.aptitudeDailyTargetMinutes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

/**
 * 5. Update Appearance & Accessibility Preferences
 */
export async function updateAppearancePreferencesAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client) => {
    const parsed = appearancePreferencesUpdateSchema.parse(rawInput);

    const { data, error } = await client
      .from("user_appearance_preferences")
      .upsert(
        {
          user_id: userId,
          theme: parsed.theme,
          motion_preference: parsed.motionPreference,
          ui_density: parsed.uiDensity,
          font_scaling: parsed.fontScaling,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/", "layout");
    return data;
  });
}

/**
 * 6. Initiate Supabase Auth Email Change Request
 */
export async function requestEmailChangeAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client) => {
    const parsed = emailChangeSchema.parse(rawInput);

    const { data, error } = await client.auth.updateUser({
      email: parsed.newEmail,
    });

    if (error) throw error;

    // Log security event
    await client.from("account_security_events").insert({
      user_id: userId,
      event_type: "EMAIL_CHANGE_REQUESTED",
      metadata: { newEmail: parsed.newEmail },
    });

    return { success: true, email: data.user?.email };
  });
}

/**
 * 7. Send Password Reset Email
 */
export async function sendPasswordResetEmailAction() {
  return executeAuthAction(async (userId, client, user) => {
    if (!user.email) throw new Error("No registered email for this account");

    const { error } = await client.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://primeprep.app"}/auth/reset-password`,
    });

    if (error) throw error;

    await client.from("account_security_events").insert({
      user_id: userId,
      event_type: "PASSWORD_RESET_DISPATCHED",
      metadata: { email: user.email },
    });

    return { success: true };
  });
}

/**
 * 8. Create Machine-Readable Data Export Job
 */
export async function createDataExportAction() {
  return executeAuthAction(async (userId, client, user) => {
    // 1. Gather all user-owned records across tables
    const [
      profileRes,
      settingsRes,
      plansRes,
      tasksRes,
      revisionsRes,
      attemptsRes,
      learningRes,
      notificationsRes,
    ] = await Promise.all([
      client.from("profiles").select("*").eq("id", userId).maybeSingle(),
      client.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      client.from("daily_plans").select("*").eq("user_id", userId).limit(100),
      client.from("daily_tasks").select("*").eq("user_id", userId).limit(300),
      client.from("revision_items").select("*").eq("user_id", userId).limit(200),
      client.from("problem_attempts").select("*").eq("user_id", userId).limit(300),
      client.from("learning_video_progress").select("*").eq("user_id", userId).limit(300),
      client
        .from("notifications")
        .select("id, category, title, body, created_at")
        .eq("user_id", userId)
        .limit(100),
    ]);

    for (const result of [
      profileRes,
      settingsRes,
      plansRes,
      tasksRes,
      revisionsRes,
      attemptsRes,
      learningRes,
      notificationsRes,
    ]) {
      if (result.error)
        throw new Error("Could not read all export records. Try again shortly.");
    }

    const exportPayload = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      account: {
        userId,
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profileRes.data,
      targetsAndSettings: settingsRes.data,
      dailyPlans: plansRes.data ?? [],
      dailyTasks: tasksRes.data ?? [],
      revisionBuffer: revisionsRes.data ?? [],
      practiceAttempts: attemptsRes.data ?? [],
      learningProgress: learningRes.data ?? [],
      notificationsSummary: notificationsRes.data ?? [],
    };

    // 2. Insert into user_data_export_jobs
    const { data: job, error } = await client
      .from("user_data_export_jobs")
      .insert({
        user_id: userId,
        status: "COMPLETED",
        export_data: exportPayload,
      })
      .select()
      .single();

    if (error) throw error;

    await client.from("account_security_events").insert({
      user_id: userId,
      event_type: "DATA_EXPORT_GENERATED",
      metadata: { jobId: job.id },
    });

    return {
      jobId: job.id,
      downloadToken: job.download_token,
      exportData: exportPayload,
    };
  });
}

/**
 * 9. Scoped Data Clears
 */
export async function clearNotificationInboxAction() {
  return executeAuthAction(async (userId, client) => {
    const { error } = await client
      .from("notifications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw error;
    return { success: true };
  });
}

export async function resetLearningPreferencesAction() {
  return executeAuthAction(async (userId, client) => {
    const { error } = await client
      .from("user_learning_preferences")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  });
}

/**
 * 10. Complete Account Deletion Lifecycle Safeguard
 */
export async function deleteAccountAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client, user) => {
    const parsed = accountDeletionSchema.parse(rawInput);
    const signedInAt = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : NaN;
    if (!Number.isFinite(signedInAt) || Date.now() - signedInAt > 15 * 60_000)
      throw new Error("Sign out and sign in again before deleting your account.");

    const admin: SupabaseClient = createAdminClient();
    const { data: request, error: requestError } = await admin
      .from("user_deletion_requests")
      .insert({ user_id: userId, status: "CONFIRMED", reason: parsed.reason || null })
      .select("id")
      .single();
    if (requestError || !request)
      throw new Error("Could not record the deletion request. Try again.");

    // Auth deletes and database foreign-key cascades commit together.
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      await admin
        .from("user_deletion_requests")
        .update({ status: "FAILED" })
        .eq("id", request.id)
        .eq("user_id", userId);
      throw new Error("Your account could not be deleted. Try again shortly.");
    }

    await client.auth.signOut({ scope: "local" });
    return { deleted: true };
  });
}
