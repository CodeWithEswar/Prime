/**
 * PRIME Focus Mode — Async Mutation Coordinator
 * Serializes and reconciles async Supabase mutations for study sessions,
 * preventing out-of-order execution, race conditions, and stale state overwrites.
 */

export interface MutationTask<T = unknown> {
  opId: number;
  type: "start" | "pause" | "resume" | "finish";
  sessionId?: string;
  taskId?: string;
  execute: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
}

export class MutationCoordinator {
  private currentOpId = 0;
  private latestCompletedOpId = 0;
  private queue: MutationTask[] = [];
  private isProcessing = false;

  public nextOpId(): number {
    return ++this.currentOpId;
  }

  public enqueue<T>(task: Omit<MutationTask<T>, "opId">): number {
    const opId = this.nextOpId();
    const fullTask: MutationTask<unknown> = {
      ...task,
      opId,
    } as MutationTask<unknown>;

    this.queue.push(fullTask);
    void this.processQueue();
    return opId;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      try {
        const result = await task.execute();
        // Ignore stale responses if a newer operation has already completed
        if (task.opId >= this.latestCompletedOpId) {
          this.latestCompletedOpId = task.opId;
          task.onSuccess?.(result);
        }
      } catch (error) {
        if (task.opId >= this.latestCompletedOpId) {
          task.onError?.(error);
        }
      }
    }

    this.isProcessing = false;
  }

  public reset(): void {
    this.queue = [];
    this.isProcessing = false;
  }
}

export const focusMutationCoordinator = new MutationCoordinator();

