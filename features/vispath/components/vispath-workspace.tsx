"use client";

import { useState, useCallback } from "react";
import { VisPathCanvas } from "./vispath-canvas";
import { VisPathHud } from "./vispath-hud";
import { NodeDetailDrawer } from "./node-detail-drawer";
import { VISPATH_NODES, VISPATH_EDGES } from "../data/roadmap-nodes";
import type { VisPathNode, VisPathTrackId, CameraState } from "../types";

export function VisPathWorkspace() {
  const [selectedTrack, setSelectedTrack] = useState<VisPathTrackId>("all");
  const [selectedNode, setSelectedNode] = useState<VisPathNode | null>(null);
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 0.95 });
  const [isFlowing, setIsFlowing] = useState<boolean>(true);

  const handleSelectNode = useCallback((node: VisPathNode) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleFocusNode = useCallback((node: VisPathNode) => {
    setSelectedNode(node);
    setCamera({
      x: -node.x * 1.15,
      y: -node.y * 1.15,
      zoom: 1.25,
    });
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedNode(null);
    setCamera({ x: 0, y: 0, zoom: 0.95 });
  }, []);

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] rounded-2xl overflow-hidden border border-[#222228] bg-[#030305] shadow-2xl">
      {/* 1. Interactive HTML5 Canvas Engine */}
      <VisPathCanvas
        nodes={VISPATH_NODES}
        edges={VISPATH_EDGES}
        selectedTrack={selectedTrack}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
        isFlowing={isFlowing}
        camera={camera}
        onCameraChange={setCamera}
      />

      {/* 2. Glassmorphic HUD & Controls */}
      <VisPathHud
        nodes={VISPATH_NODES}
        selectedTrack={selectedTrack}
        onSelectTrack={setSelectedTrack}
        onSelectNode={handleSelectNode}
        camera={camera}
        onCameraChange={setCamera}
        isFlowing={isFlowing}
        onToggleFlow={() => setIsFlowing((prev) => !prev)}
        onResetView={handleResetView}
      />

      {/* 3. Node Detail & Topic Expansion Slide-Over Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        onClose={handleCloseDrawer}
        onFocusNode={handleFocusNode}
      />
    </div>
  );
}
