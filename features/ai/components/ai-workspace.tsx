"use client";
import { useAI } from "../ai-provider";
import { AISurface, ConversationRail, ContextTrace } from "./ai-surface";
import "./ai.css";
export default function AIWorkspace() {
  const ai = useAI();
  if (!ai?.enabled)
    return (
      <div className="ai-disabled">
        <h1>PRIME AI</h1>
        <p>AI is currently disabled. Your preparation workspace remains available.</p>
      </div>
    );
  return (
    <section className="ai-workspace" aria-label="PRIME AI workspace">
      <aside className="ai-workspace-history">
        <ConversationRail />
      </aside>
      <AISurface />
      <aside className="ai-workspace-context">
        <ContextTrace />
        <div className="ai-context-note">
          <span className="ai-eyebrow">PRIME is the source of truth</span>
          <p>
            Curriculum order, revision dates and progress come from your recorded data. AI
            explains and teaches.
          </p>
        </div>
      </aside>
    </section>
  );
}
