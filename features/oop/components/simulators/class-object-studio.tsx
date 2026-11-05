"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CodeIcon,
  CheckmarkBadge01Icon,
  RefreshIcon,
  Add01Icon,
  Edit02Icon,
  Layers01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  STUDENT_BLUEPRINT,
  instantiateStudent,
  updateInstanceGpa,
  type StudentInstance,
} from "@/domain/oop";

interface ClassObjectStudioProps {
  onComplete?: () => void;
}

export function ClassObjectStudio({ onComplete }: ClassObjectStudioProps) {
  const [instances, setInstances] = useState<StudentInstance[]>(() => [
    {
      id: "student-initial-1",
      name: "Alice Sharma",
      rollNumber: 101,
      gpa: 3.85,
      memoryAddress: "0x7f4a21",
    },
    {
      id: "student-initial-2",
      name: "Bob Verma",
      rollNumber: 102,
      gpa: 3.65,
      memoryAddress: "0x7f4b89",
    },
  ]);

  const [newName, setNewName] = useState("Charlie Rao");
  const [newRoll, setNewRoll] = useState(103);
  const [newGpa, setNewGpa] = useState(3.9);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("student-initial-1");
  const [editGpa, setEditGpa] = useState<number>(4.0);
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);
  const [events, setEvents] = useState<string[]>([
    "Initialized Class blueprint 'Student' with 2 active heap instances.",
  ]);

  const handleCreateInstance = () => {
    const res = instantiateStudent(newName, newRoll, newGpa);
    if (!res.success || !res.instance) {
      setFeedback({ isError: true, message: res.error || "Instantiation failed." });
      return;
    }

    setInstances((prev) => [...prev, res.instance!]);
    setSelectedInstanceId(res.instance.id);
    setNewRoll((prev) => prev + 1);
    setFeedback({
      isError: false,
      message: `Created Student@${res.instance.memoryAddress} ('${res.instance.name}') successfully.`,
    });
    setEvents((prev) => [
      ...prev,
      `[ALLOCATION] new Student("${res.instance!.name}", ${res.instance!.rollNumber}, ${res.instance!.gpa}) -> allocated at ${res.instance!.memoryAddress}`,
    ]);

    if (onComplete) onComplete();
  };

  const handleUpdateGpa = () => {
    const res = updateInstanceGpa(instances, selectedInstanceId, editGpa);
    if (!res.success) {
      setFeedback({ isError: true, message: res.error || "Update failed." });
      return;
    }

    setInstances(res.instances);
    const target = res.instances.find((i) => i.id === selectedInstanceId);
    setFeedback({
      isError: false,
      message: `Updated GPA for ${target?.name} to ${target?.gpa}. Notice other instances remain unchanged!`,
    });
    setEvents((prev) => [
      ...prev,
      `[MUTATION] ${target?.name}@${target?.memoryAddress}.gpa updated to ${target?.gpa}. State isolation preserved.`,
    ]);

    if (onComplete) onComplete();
  };

  const handleReset = () => {
    setInstances([
      {
        id: "student-initial-1",
        name: "Alice Sharma",
        rollNumber: 101,
        gpa: 3.85,
        memoryAddress: "0x7f4a21",
      },
    ]);
    setSelectedInstanceId("student-initial-1");
    setFeedback(null);
    setEvents(["Reset to initial single instance."]);
  };

  const selectedInstance = instances.find((i) => i.id === selectedInstanceId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 01
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Foundations
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Class Blueprint & Instance State Isolation
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#262626] bg-[#141414] text-[#CCCCCC] hover:text-white"
          >
            <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
            Reset
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-3 text-xs ${
            feedback.isError
              ? "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
              : "border-green-500/40 bg-green-500/10 text-green-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon icon={feedback.isError ? AlertCircleIcon : CheckmarkBadge01Icon} size={16} />
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Blueprint vs Heap Instances vs Mutation Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Class Blueprint (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Compile-Time Blueprint
            </span>
            <Badge variant="outline" className="font-mono text-[11px] text-[#FF4D4D]">
              class {STUDENT_BLUEPRINT.className}
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="rounded-lg border border-[#1A1A1A] bg-[#050505] p-3 text-[#CCCCCC]">
              <span className="text-[#FF8080]">// Fields (State template)</span>
              {STUDENT_BLUEPRINT.fields.map((f) => (
                <div key={f.name} className="mt-1 flex items-center justify-between">
                  <span className="text-[#888888]">{f.access} {f.type}</span>
                  <span className="text-white">{f.name};</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-[#1A1A1A] bg-[#050505] p-3 text-[#CCCCCC]">
              <span className="text-[#FF8080]">// Methods (Behavior)</span>
              {STUDENT_BLUEPRINT.methods.map((m) => (
                <div key={m.name} className="mt-1 text-[11px]">
                  <span className="text-white">{m.name}</span>
                  <span className="text-[#888888]">({m.parameters.join(", ")})</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Instance Creator Form */}
          <div className="space-y-3 border-t border-[#1A1A1A] pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Invoke new {STUDENT_BLUEPRINT.className}()
            </span>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-[#888888]">Student Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded border border-[#262626] bg-[#121212] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#888888]">Roll Number</label>
                  <input
                    type="number"
                    value={newRoll}
                    onChange={(e) => setNewRoll(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded border border-[#262626] bg-[#121212] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#888888]">GPA (0.0 - 4.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newGpa}
                    onChange={(e) => setNewGpa(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded border border-[#262626] bg-[#121212] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
                  />
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateInstance}
                className="w-full bg-[#FF0000] text-white hover:bg-[#D90000]"
              >
                <Icon icon={Add01Icon} size={14} className="mr-1.5" />
                Instantiate on Heap
              </Button>
            </div>
          </div>
        </div>

        {/* Center: Live Heap Memory (5 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              JVM Heap Memory ({instances.length} Objects)
            </span>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              State Isolated
            </Badge>
          </div>

          <div className="space-y-3">
            {instances.map((inst) => {
              const isSelected = inst.id === selectedInstanceId;
              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstanceId(inst.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    isSelected
                      ? "border-[#FF0000] bg-[#1A0A0A] shadow-md shadow-[#FF0000]/10"
                      : "border-[#1F1F1F] bg-[#121212] hover:border-[#333333]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon icon={Layers01Icon} size={16} className={isSelected ? "text-[#FF0000]" : "text-[#888888]"} />
                      <span className="font-mono text-xs font-bold text-white">{inst.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#FF8080]">{inst.memoryAddress}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#1F1F1F] pt-2 font-mono text-[11px]">
                    <div>
                      <span className="text-[#888888]">rollNumber:</span>{" "}
                      <span className="text-white">{inst.rollNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#888888]">gpa:</span>{" "}
                      <span className="font-bold text-green-400">{inst.gpa.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mutator for Selected Instance */}
          {selectedInstance && (
            <div className="rounded-lg border border-[#262626] bg-[#0F0F0F] p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
                Mutate Selected: {selectedInstance.name}
              </span>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="number"
                  step="0.05"
                  value={editGpa}
                  onChange={(e) => setEditGpa(parseFloat(e.target.value) || 0)}
                  className="w-28 rounded border border-[#262626] bg-[#161616] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateGpa}
                  className="border-[#262626] bg-[#1A1A1A] text-white hover:border-[#FF0000]"
                >
                  <Icon icon={Edit02Icon} size={14} className="mr-1.5" />
                  Call updateGpa({editGpa})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Execution Log & Verification (3 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Execution Trace
            </span>
            <Icon icon={CodeIcon} size={16} className="text-[#888888]" />
          </div>

          <div className="h-72 space-y-2 overflow-y-auto font-mono text-[11px] text-[#888888]">
            {events.map((ev, i) => (
              <div key={i} className="border-b border-[#141414] pb-1.5">
                <span className="text-[#FF4D4D]">&gt;</span> {ev}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#CCCCCC]">
            <span className="font-bold text-[#FF8080]">Core Invariant:</span> Each instance retains private state. Mutating `Alice.gpa` does not modify `Bob.gpa`.
          </div>
        </div>
      </div>
    </div>
  );
}

