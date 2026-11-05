"use client";
import { useState } from "react";
import Markdown from "./markdown-renderer";
import { useAI } from "../ai-provider";
import "./ai.css";
import "./notes.css";
export function SavedNotes({
  notes,
}: {
  notes: { id: string; body: string; updated_at: string }[];
}) {
  const ai = useAI();
  const [selected, setSelected] = useState(notes[0]?.id);
  const note = notes.find((n) => n.id === selected);
  return (
    <div className="ai-notebook">
      <nav aria-label="Saved notes">
        {notes.map((n) => (
          <button
            key={n.id}
            aria-current={selected === n.id ? "true" : undefined}
            onClick={() => setSelected(n.id)}
          >
            {n.body
              .split("\n")
              .find((x) => x.trim())
              ?.replace(/^#+\s*/, "")
              .slice(0, 100) || "Untitled note"}
            <small>{new Date(n.updated_at).toLocaleDateString()}</small>
          </button>
        ))}
      </nav>
      {note && (
        <article>
          <div className="ai-action-row">
            {ai?.enabled && (
              <button
                className="ai-secondary"
                onClick={(e) => {
                  ai.newConversation({ type: "notes", ref: note.id });
                  ai.setOpen(true, e.currentTarget, { type: "notes", ref: note.id });
                }}
              >
                Discuss with PRIME
              </button>
            )}
          </div>
          <Markdown content={note.body} />
        </article>
      )}
    </div>
  );
}
