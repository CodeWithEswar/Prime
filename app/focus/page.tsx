import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTodaySnapshot } from "@/features/today/server/get-today-snapshot";
import { startStudySessionAction } from "@/features/today/server/session-actions";
import { FocusScreen } from "@/features/focus/components/focus-screen";

export const instant = false;

interface FocusPageProps {
  searchParams: Promise<{ taskId?: string }>;
}

export default async function FocusPage({ searchParams }: FocusPageProps) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { taskId } = await searchParams;

  // If a specific task was requested to start focus on
  if (taskId) {
    await startStudySessionAction(taskId);
  }

  const snapshot = await getTodaySnapshot(supabase, user.id);

  if (!snapshot.activeSession) {
    redirect("/today");
  }

  const task = snapshot.tasks.find((t) => t.id === snapshot.activeSession?.taskId);

  return (
    <FocusScreen
      session={snapshot.activeSession}
      task={task}
    />
  );
}

