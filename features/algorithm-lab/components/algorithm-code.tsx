"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeFrame } from "@/features/ai/markdown/code-frame";
import type { AlgorithmModule } from "../engine/types";
export default function AlgorithmCode({
  module,
  activeCode,
}: {
  module: AlgorithmModule;
  activeCode: string;
}) {
  const [tab, setTab] = useState("java"),
    code = tab === "java" ? module.java : module.pseudocode,
    index = code.lines.findIndex((line) => line.id === activeCode);
  return (
    <div className="lab-code-body">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" layoutId="lab-code-language">
          <TabsTrigger value="java">Java</TabsTrigger>
          <TabsTrigger value="pseudocode">Pseudocode</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="lab-active-line">
        <span aria-hidden="true">◆</span> Active line {index + 1}:{" "}
        <code>{code.lines[index]?.text.trim()}</code>
      </p>
      <CodeFrame
        source={code.lines.map((line) => line.text).join("\n")}
        language={tab === "java" ? "java" : "text"}
        title={tab === "java" ? `${module.id}.java` : "Pseudocode"}
        highlightedLines={index >= 0 ? [index + 1] : []}
      />
    </div>
  );
}
