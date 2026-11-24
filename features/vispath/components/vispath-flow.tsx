"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { FigmaNode, type FigmaFlowNode } from "./figma-node";
import { FigmaEdge, type FigmaFlowEdge } from "./figma-edge";
import { FigmaToolbar } from "./figma-toolbar";
import { FigmaInspector } from "./figma-inspector";
import { VISPATH_NODES, VISPATH_EDGES } from "../data/roadmap-nodes";
import type { VisPathNode, VisPathTrackId, VisPathNodeData } from "../types";

const NODE_FLOW_POSITIONS: Record<string, { x: number; y: number }> = {
  // CS Fundamentals (Top Track, y = 80)
  "cs-1": { x: 500, y: 80 },
  "cs-2": { x: 1100, y: 80 },
  "cs-3": { x: 1700, y: 80 },
  "cs-4": { x: 2300, y: 80 },

  // Data Engineering Mastery (Central Spine, y = 440)
  "de-1": { x: 100, y: 440 },
  "de-2": { x: 500, y: 440 },
  "de-3": { x: 900, y: 440 },
  "de-4": { x: 1300, y: 440 },
  "de-5": { x: 1700, y: 440 },
  "de-6": { x: 2100, y: 440 },
  "de-7": { x: 2500, y: 440 },
  "de-8": { x: 2900, y: 440 },

  // DSA & Patterns (Bottom Track, y = 800)
  "dsa-1": { x: 100, y: 800 },
  "dsa-2": { x: 700, y: 800 },
  "dsa-3": { x: 1400, y: 800 },
  "dsa-4": { x: 2100, y: 800 },
};

const CROSS_TRACK_HANDLES: Record<string, { sourceHandle: string; targetHandle: string }> = {
  "e-cs1-de2": { sourceHandle: "bottom", targetHandle: "top" },
  "e-cs2-de4": { sourceHandle: "bottom", targetHandle: "top" },
  "e-cs3-de6": { sourceHandle: "bottom", targetHandle: "top" },
  "e-dsa1-de1": { sourceHandle: "top", targetHandle: "bottom" },
  "e-dsa2-de5": { sourceHandle: "top", targetHandle: "bottom" },
  "e-dsa4-de7": { sourceHandle: "top", targetHandle: "bottom" },
};

const nodeTypes: NodeTypes = {
  figmaNode: FigmaNode,
};

const edgeTypes: EdgeTypes = {
  figmaEdge: FigmaEdge,
};

function VisPathFlowCanvas() {
  const reactFlow = useReactFlow();

  const [selectedTrack, setSelectedTrack] = useState<VisPathTrackId>("all");
  const [selectedNode, setSelectedNode] = useState<VisPathNode | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(["de-1"]));
  const [isFlowing, setIsFlowing] = useState<boolean>(true);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [panMode, setPanMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const handleExpandToggle = useCallback((nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((node: VisPathNode) => {
    setSelectedNode(node);
  }, []);

  const handleFocusNode = useCallback(
    (node: VisPathNode) => {
      setSelectedNode(node);
      const pos = NODE_FLOW_POSITIONS[node.id] || { x: 0, y: 0 };
      reactFlow.setCenter(pos.x + 170, pos.y + 110, {
        zoom: 1.15,
        duration: 700,
      });
    },
    [reactFlow]
  );

  // Generate React Flow Nodes based on track filter & expansion state
  const rawNodes = useMemo(() => {
    const visibleNodes =
      selectedTrack === "all"
        ? VISPATH_NODES
        : VISPATH_NODES.filter((n) => n.track === selectedTrack);

    return visibleNodes.map((node): FigmaFlowNode => {
      const pos = NODE_FLOW_POSITIONS[node.id] || { x: node.x * 2.2 + 500, y: node.y * 1.8 + 400 };
      const isSelected = selectedNode?.id === node.id;
      const isExpanded = expandedNodeIds.has(node.id);

      return {
        id: node.id,
        type: "figmaNode",
        position: pos,
        data: {
          node,
          isSelected,
          isExpanded,
          onExpandToggle: handleExpandToggle,
          onSelect: handleSelectNode,
        },
      };
    });
  }, [selectedTrack, selectedNode, expandedNodeIds, handleExpandToggle, handleSelectNode]);

  // Generate React Flow Edges based on track filter & flow state
  const rawEdges = useMemo(() => {
    const visibleEdges =
      selectedTrack === "all"
        ? VISPATH_EDGES
        : VISPATH_EDGES.filter((e) => e.track === selectedTrack);

    const activeNodeIds = new Set(
      (selectedTrack === "all"
        ? VISPATH_NODES
        : VISPATH_NODES.filter((n) => n.track === selectedTrack)
      ).map((n) => n.id)
    );

    return visibleEdges
      .filter((e) => activeNodeIds.has(e.from) && activeNodeIds.has(e.to))
      .map((edge): FigmaFlowEdge => {
        const handleConfig = CROSS_TRACK_HANDLES[edge.id] || {
          sourceHandle: "right",
          targetHandle: "left",
        };

        const isEdgeSelected =
          selectedNode && (selectedNode.id === edge.from || selectedNode.id === edge.to);

        return {
          id: edge.id,
          type: "figmaEdge",
          source: edge.from,
          target: edge.to,
          sourceHandle: handleConfig.sourceHandle,
          targetHandle: handleConfig.targetHandle,
          data: {
            edge,
            track: edge.track,
            isFlowing,
          },
          selected: Boolean(isEdgeSelected),
        };
      });
  }, [selectedTrack, isFlowing, selectedNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FigmaFlowNode>(rawNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FigmaFlowEdge>(rawEdges);

  // Synchronize generated nodes & edges with state
  useEffect(() => {
    setNodes(rawNodes);
  }, [rawNodes, setNodes]);

  useEffect(() => {
    setEdges(rawEdges);
  }, [rawEdges, setEdges]);

  // Initial fit view on mount or track change
  useEffect(() => {
    const timer = setTimeout(() => {
      reactFlow.fitView({ padding: 0.15, duration: 600 });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedTrack, reactFlow]);

  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn({ duration: 300 });
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut({ duration: 300 });
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    reactFlow.fitView({ padding: 0.15, duration: 500 });
  }, [reactFlow]);

  const handleResetView = useCallback(() => {
    setSelectedNode(null);
    reactFlow.fitView({ padding: 0.15, duration: 500 });
  }, [reactFlow]);

  return (
    <div className="relative w-full h-full select-none bg-black">
      {/* 1. Figma Floating Control Toolbar */}
      <FigmaToolbar
        nodes={VISPATH_NODES}
        selectedTrack={selectedTrack}
        onSelectTrack={setSelectedTrack}
        onFocusNode={handleFocusNode}
        isFlowing={isFlowing}
        onToggleFlow={() => setIsFlowing((prev) => !prev)}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        panMode={panMode}
        onTogglePanMode={() => setPanMode((prev) => !prev)}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onResetView={handleResetView}
      />

      {/* 2. Core React Flow Canvas */}
      <ReactFlow<FigmaFlowNode, FigmaFlowEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panOnDrag={panMode ? true : [1, 2]}
        panOnScroll={true}
        zoomOnScroll={true}
        onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
        onPaneClick={() => setSelectedNode(null)}
        minZoom={0.2}
        maxZoom={2.0}
        defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
        proOptions={{ hideAttribution: true }}
        className="touch-none"
      >
        {/* Figma Ambient Dotted Canvas Grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255, 255, 255, 0.08)"
        />

        {/* Figma Dark MiniMap */}
        {showMinimap && (
          <MiniMap
            zoomable
            pannable
            className="!bottom-5 !right-5 !m-0 !hidden md:!block !rounded-md !border !border-zinc-800 !bg-zinc-950/90 !shadow-2xl overflow-hidden"
            nodeColor={(n) => {
              const nodeData = n.data as VisPathNodeData | undefined;
              if (nodeData?.node?.color) {
                return nodeData.node.color;
              }
              return "#3B82F6";
            }}
            nodeStrokeWidth={3}
            maskColor="rgba(0, 0, 0, 0.85)"
          />
        )}
      </ReactFlow>

      {/* 3. Figma Design Inspector (Right Properties Drawer) */}
      <FigmaInspector
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onFocusNode={handleFocusNode}
        allNodes={VISPATH_NODES}
      />
    </div>
  );
}

export function VisPathFlow() {
  return (
    <ReactFlowProvider>
      <VisPathFlowCanvas />
    </ReactFlowProvider>
  );
}
