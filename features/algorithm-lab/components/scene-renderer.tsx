"use client";
import dynamic from "next/dynamic";
import ArrayRenderer from "../renderers/array-renderer";
import type { Scene } from "../engine/types";
const Sequence = dynamic(() => import("../renderers/sequence-renderer"), {
  loading: () => <p role="status">Loading structure…</p>,
});
const Network = dynamic(() => import("../renderers/network-renderer"), {
  loading: () => <p role="status">Loading diagram…</p>,
});
export function SceneRenderer({ scene }: { scene: Scene }) {
  return scene.kind === "array" ? (
    <ArrayRenderer scene={scene} />
  ) : scene.kind === "network" ? (
    <Network scene={scene} />
  ) : (
    <Sequence scene={scene} />
  );
}
